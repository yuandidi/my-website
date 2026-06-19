import type { ProfileLink, SiteProfile } from '@my-blog/shared';
import type { UpdateProfileInput } from './profile-validation';
import { validateUpdateProfileInput } from './profile-validation';
import { query } from './db';

interface ProfileRow {
  userId: string;
  name: string;
  title: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  links: ProfileLink[];
  updatedAt: Date;
}

export const DEFAULT_PROFILE = {
  name: '迪迪',
  title: '开发者 & 写作者',
  avatarUrl: '/favicon.png',
  bio: `欢迎来到迪迪の秘密小屋。

这里是迪迪的个人站点，记录技术探索与生活随笔。

内容筹备中，敬请期待。`,
  skills: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', '写作'],
  links: [{ label: 'GitHub', href: 'https://github.com/yuandidi' }],
} as const;

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function mapProfileRow(row: ProfileRow): SiteProfile {
  return {
    name: row.name,
    title: row.title,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    skills: parseJsonArray<string>(row.skills),
    links: parseJsonArray<ProfileLink>(row.links),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureProfileForUser(
  userId: string,
  overrides?: Partial<Pick<SiteProfile, 'name' | 'avatarUrl'>>,
) {
  const existing = await query<ProfileRow>(
    `SELECT "userId", name, title, "avatarUrl", bio, skills, links, "updatedAt"
     FROM "Profile"
     WHERE "userId" = $1`,
    [userId],
  );

  if (existing[0]) {
    return mapProfileRow(existing[0]);
  }

  const now = new Date();
  const name = overrides?.name?.trim() || DEFAULT_PROFILE.name;
  const avatarUrl = overrides?.avatarUrl?.trim() || DEFAULT_PROFILE.avatarUrl;

  const rows = await query<ProfileRow>(
    `INSERT INTO "Profile" ("userId", name, title, "avatarUrl", bio, skills, links, "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
     RETURNING "userId", name, title, "avatarUrl", bio, skills, links, "updatedAt"`,
    [
      userId,
      name,
      DEFAULT_PROFILE.title,
      avatarUrl,
      DEFAULT_PROFILE.bio,
      JSON.stringify(DEFAULT_PROFILE.skills),
      JSON.stringify(DEFAULT_PROFILE.links),
      now,
    ],
  );

  return mapProfileRow(rows[0]);
}

export async function getSiteProfile() {
  const rows = await query<ProfileRow>(
    `SELECT "userId", name, title, "avatarUrl", bio, skills, links, "updatedAt"
     FROM "Profile"
     ORDER BY "updatedAt" DESC
     LIMIT 1`,
  );

  if (!rows[0]) {
    return null;
  }

  return mapProfileRow(rows[0]);
}

export async function updateSiteProfile(userId: string, input: UpdateProfileInput) {
  validateUpdateProfileInput(input);

  await ensureProfileForUser(userId);

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(input.name.trim());
  }
  if (input.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(input.title.trim());
  }
  if (input.avatarUrl !== undefined) {
    fields.push(`"avatarUrl" = $${index++}`);
    values.push(input.avatarUrl.trim());
  }
  if (input.bio !== undefined) {
    fields.push(`bio = $${index++}`);
    values.push(input.bio);
  }
  if (input.skills !== undefined) {
    fields.push(`skills = $${index++}::jsonb`);
    values.push(JSON.stringify(input.skills.map((skill) => skill.trim())));
  }
  if (input.links !== undefined) {
    fields.push(`links = $${index++}::jsonb`);
    values.push(
      JSON.stringify(
        input.links
          .map((link) => ({
            label: link.label.trim(),
            href: link.href.trim(),
          }))
          .filter((link) => link.label && link.href),
      ),
    );
  }

  if (fields.length === 0) {
    const current = await query<ProfileRow>(
      `SELECT "userId", name, title, "avatarUrl", bio, skills, links, "updatedAt"
       FROM "Profile"
       WHERE "userId" = $1`,
      [userId],
    );
    if (!current[0]) {
      throw new Error('Profile not found');
    }
    return mapProfileRow(current[0]);
  }

  fields.push(`"updatedAt" = $${index++}`);
  values.push(new Date());
  values.push(userId);

  const rows = await query<ProfileRow>(
    `UPDATE "Profile"
     SET ${fields.join(', ')}
     WHERE "userId" = $${index}
     RETURNING "userId", name, title, "avatarUrl", bio, skills, links, "updatedAt"`,
    values,
  );

  if (!rows[0]) {
    throw new Error('Profile not found');
  }

  return mapProfileRow(rows[0]);
}
