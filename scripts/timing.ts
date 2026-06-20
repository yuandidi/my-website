import { spawn, spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

export interface PhaseResult {
  name: string;
  durationMs: number;
  success: boolean;
}

export interface TimingReport {
  pipeline: string;
  job?: string;
  timestamp: string;
  phases: Array<PhaseResult & { duration: string }>;
  totalMs: number;
  total: string;
}

export type PipelineStep =
  | { kind: 'phase'; name: string; command: string[] }
  | {
      kind: 'parallel';
      name: string;
      phases: Array<{ name: string; command: string[] }>;
    };

const TIMING_DIR = join(process.cwd(), '.timing');
const useShell = process.platform === 'win32';

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function runPhaseSync(
  name: string,
  command: string,
  args: string[],
): PhaseResult {
  const start = performance.now();
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: useShell,
    env: process.env,
  });
  const durationMs = performance.now() - start;

  return {
    name,
    durationMs,
    success: result.status === 0,
  };
}

function runPhaseAsync(
  name: string,
  command: string,
  args: string[],
): Promise<PhaseResult> {
  return new Promise((resolve) => {
    const start = performance.now();
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: useShell,
      env: process.env,
    });

    child.on('close', (code) => {
      resolve({
        name,
        durationMs: performance.now() - start,
        success: code === 0,
      });
    });
  });
}

function buildReport(
  pipeline: string,
  results: PhaseResult[],
  job?: string,
  totalMs?: number,
): TimingReport {
  const computedTotal =
    totalMs ?? results.reduce((sum, item) => sum + item.durationMs, 0);

  return {
    pipeline,
    job,
    timestamp: new Date().toISOString(),
    phases: results.map((item) => ({
      ...item,
      duration: formatDuration(item.durationMs),
    })),
    totalMs: computedTotal,
    total: formatDuration(computedTotal),
  };
}

export function printReport(
  pipeline: string,
  results: PhaseResult[],
  totalMs?: number,
) {
  const report = buildReport(pipeline, results, undefined, totalMs);
  const nameWidth = Math.max(
    'total (wall)'.length,
    ...results.map((item) => item.name.length),
  );

  console.log(`\n── ${pipeline} timing ──`);
  for (const item of results) {
    const status = item.success ? 'ok' : 'FAIL';
    console.log(
      `  [${status}] ${item.name.padEnd(nameWidth)}  ${formatDuration(item.durationMs)}`,
    );
  }
  console.log(
    `  ${'total (wall)'.padEnd(nameWidth + 7)}${report.total}`,
  );
  console.log('');
}

function appendGithubSummary(report: TimingReport, enabled = true) {
  if (!enabled) return;

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const title = report.job ?? report.pipeline;
  const lines = [
    `## ${title} timing`,
    '',
    '| Phase | Duration | Status |',
    '|-------|----------|--------|',
    ...report.phases.map(
      (item) =>
        `| ${item.name} | ${item.duration} | ${item.success ? 'pass' : 'fail'} |`,
    ),
    `| **total (wall)** | **${report.total}** | |`,
    '',
  ];

  appendFileSync(summaryPath, `${lines.join('\n')}\n`);
}

function persistReport(report: TimingReport) {
  if (!existsSync(TIMING_DIR)) {
    mkdirSync(TIMING_DIR, { recursive: true });
  }

  const jobKey = (report.job ?? report.pipeline).replace(/[^\w-]+/g, '-');
  writeFileSync(
    join(TIMING_DIR, `${jobKey}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const historyPath = join(TIMING_DIR, 'history.jsonl');
  appendFileSync(historyPath, `${JSON.stringify(report)}\n`);
}

function loadExistingResults(job: string): PhaseResult[] {
  const filePath = join(TIMING_DIR, `${job.replace(/[^\w-]+/g, '-')}.json`);
  if (!existsSync(filePath)) return [];

  try {
    const report = JSON.parse(readFileSync(filePath, 'utf8')) as TimingReport;
    return report.phases.map((item) => ({
      name: item.name,
      durationMs: item.durationMs,
      success: item.success,
    }));
  } catch {
    return [];
  }
}

export function finalizeReport(
  pipeline: string,
  results: PhaseResult[],
  options?: {
    job?: string;
    append?: boolean;
    writeSummary?: boolean;
    totalMs?: number;
  },
) {
  const job = options?.job ?? process.env.CI_JOB_NAME ?? pipeline;
  const merged = options?.append
    ? [...loadExistingResults(job), ...results]
    : results;
  const report = buildReport(pipeline, merged, job, options?.totalMs);

  printReport(pipeline, merged, options?.totalMs);
  persistReport(report);
  appendGithubSummary(report, options?.writeSummary ?? true);

  return report;
}

function runPhaseStep(phase: { name: string; command: string[] }): PhaseResult {
  const [command, ...args] = phase.command;
  console.log(`\n> ${phase.name}`);
  return runPhaseSync(phase.name, command, args);
}

async function runParallelStep(step: {
  name: string;
  phases: Array<{ name: string; command: string[] }>;
}): Promise<PhaseResult[]> {
  console.log(`\n> ${step.name} (parallel)`);
  for (const phase of step.phases) {
    console.log(`  · ${phase.name}`);
  }

  const groupStart = performance.now();
  const results = await Promise.all(
    step.phases.map((phase) => {
      const [command, ...args] = phase.command;
      return runPhaseAsync(phase.name, command, args);
    }),
  );
  const wallMs = performance.now() - groupStart;

  return [
    ...results,
    {
      name: `${step.name} (wall)`,
      durationMs: wallMs,
      success: results.every((item) => item.success),
    },
  ];
}

export async function runPipeline(
  pipeline: string,
  steps: PipelineStep[],
  options?: { job?: string; append?: boolean },
) {
  const job = options?.job ?? process.env.CI_JOB_NAME ?? pipeline;
  const shouldAppend =
    options?.append ??
    Boolean(process.env.CI && loadExistingResults(job).length > 0);
  const results: PhaseResult[] = [];
  const pipelineStart = performance.now();

  for (const step of steps) {
    if (step.kind === 'phase') {
      const result = runPhaseStep(step);
      results.push(result);

      if (!result.success) {
        finalizeReport(pipeline, results, {
          job,
          append: shouldAppend,
          totalMs: performance.now() - pipelineStart,
        });
        process.exit(1);
      }
      continue;
    }

    const groupResults = await runParallelStep(step);
    results.push(...groupResults);

    if (!groupResults.every((item) => item.success)) {
      finalizeReport(pipeline, results, {
        job,
        append: shouldAppend,
        totalMs: performance.now() - pipelineStart,
      });
      process.exit(1);
    }
  }

  finalizeReport(pipeline, results, {
    job,
    append: shouldAppend,
    totalMs: performance.now() - pipelineStart,
  });
}

export function runSinglePhase(name: string, command: string[]) {
  const [executable, ...args] = command;
  console.log(`\n> ${name}`);
  const result = runPhaseSync(name, executable, args);
  const job = process.env.CI_JOB_NAME ?? 'ci';
  finalizeReport(job, [result], {
    job,
    append: true,
    writeSummary: false,
  });
  process.exit(result.success ? 0 : 1);
}
