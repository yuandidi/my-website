import { runPipeline, runSinglePhase, type PipelineStep } from './timing';

const PIPELINES: Record<string, PipelineStep[]> = {
  check: [
    {
      kind: 'parallel',
      name: 'verify',
      phases: [
        { name: 'typecheck:lib', command: ['pnpm', 'typecheck:lib'] },
        { name: 'typecheck:web', command: ['pnpm', 'typecheck:web'] },
        { name: 'lint', command: ['pnpm', '--filter', 'web', 'lint'] },
        { name: 'test', command: ['pnpm', '--filter', 'web', 'test'] },
      ],
    },
  ],
  build: [
    {
      kind: 'phase',
      name: 'build:shared',
      command: ['pnpm', '--filter', '@my-blog/shared', 'build'],
    },
    {
      kind: 'phase',
      name: 'build:web',
      command: ['pnpm', '--filter', 'web', 'build'],
    },
  ],
  'check:full': [
    {
      kind: 'phase',
      name: 'build:shared',
      command: ['pnpm', '--filter', '@my-blog/shared', 'build'],
    },
    {
      kind: 'parallel',
      name: 'release',
      phases: [
        { name: 'build:web', command: ['pnpm', '--filter', 'web', 'build'] },
        { name: 'typecheck:lib', command: ['pnpm', 'typecheck:lib'] },
        { name: 'test', command: ['pnpm', '--filter', 'web', 'test'] },
      ],
    },
  ],
};

function printUsage() {
  console.error(
    [
      'Usage:',
      '  tsx scripts/timed-phases.ts <check|build|check:full>',
      '  tsx scripts/timed-phases.ts run <phase-name> -- <command...>',
    ].join('\n'),
  );
}

async function main() {
  const [mode, phaseName, separator, ...command] = process.argv.slice(2);

  if (mode === 'run') {
    if (!phaseName || separator !== '--' || command.length === 0) {
      printUsage();
      process.exit(1);
    }

    runSinglePhase(phaseName, command);
    return;
  }

  if (!mode || !(mode in PIPELINES)) {
    printUsage();
    process.exit(1);
  }

  await runPipeline(mode, PIPELINES[mode]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
