import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AuthUser, UserRole } from '@my-blog/shared';
import { query } from './db';

export const SESSION_COOKIE_NAME = 'mb_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

interface UserRow {
  id: string;
  githubId: string;
  githubLogin: string;
  email: string | null;
  role: UserRole;
}

interface SessionRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

function getAuthSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error('AUTH_SESSION_SECRET is not configured');
  }
  return secret;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    githubLogin: row.githubLogin,
    role: row.role,
  };
}

export function getSiteUrlFromHeaders(host?: string, proto?: string | string[]) {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const resolvedHost = host ?? 'localhost:3000';
  const resolvedProto = Array.isArray(proto) ? proto[0] : proto ?? 'http';
  return `${resolvedProto}://${resolvedHost}`;
}

export function createOAuthState() {
  const nonce = randomBytes(16).toString('hex');
  const expiresAt = Date.now() + OAUTH_STATE_TTL_MS;
  const payload = `${expiresAt}.${nonce}`;
  const signature = createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

export function verifyOAuthState(state: string) {
  const [expiresAtRaw, nonce, signature] = state.split('.');
  if (!expiresAtRaw || !nonce || !signature) {
    throw new Error('Invalid OAuth state');
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    throw new Error('OAuth state expired');
  }

  const payload = `${expiresAtRaw}.${nonce}`;
  const expected = createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('hex');

  const actualBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid OAuth state');
  }
}

export function getGithubAuthUrl(siteUrl: string, state: string) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured');
  }

  const redirectUri = `${siteUrl}/api/auth/github/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGithubCode(code: string, siteUrl: string) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured');
  }

  const redirectUri = `${siteUrl}/api/auth/github/callback`;
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('GitHub token exchange failed');
  }

  const data = (await response.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(data.error ?? 'GitHub token exchange failed');
  }

  return data.access_token;
}

export async function fetchGithubUser(accessToken: string): Promise<GithubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'my-blog-auth',
    },
  });

  if (!response.ok) {
    throw new Error('GitHub user fetch failed');
  }

  return response.json() as Promise<GithubUser>;
}

export function resolveRoleForGithubLogin(login: string): UserRole {
  const developerLogin =
    process.env.GITHUB_DEVELOPER_LOGIN?.trim() ||
    process.env.GITHUB_ALLOWED_LOGIN?.trim();

  if (
    developerLogin &&
    login.toLowerCase() === developerLogin.toLowerCase()
  ) {
    return 'DEVELOPER';
  }

  return 'USER';
}

export async function findOrCreateUserFromGithub(githubUser: GithubUser) {
  const role = resolveRoleForGithubLogin(githubUser.login);

  const existing = await query<UserRow>(
    `SELECT id, "githubId", "githubLogin", email, role
     FROM "User"
     WHERE "githubId" = $1`,
    [String(githubUser.id)],
  );

  if (existing[0]) {
    if (existing[0].role !== role) {
      const rows = await query<UserRow>(
        `UPDATE "User"
         SET role = $1, "updatedAt" = $2
         WHERE id = $3
         RETURNING id, "githubId", "githubLogin", email, role`,
        [role, new Date(), existing[0].id],
      );
      return rows[0];
    }

    return existing[0];
  }

  const id = randomUUID();
  const now = new Date();
  const rows = await query<UserRow>(
    `INSERT INTO "User" (id, "githubId", "githubLogin", email, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     RETURNING id, "githubId", "githubLogin", email, role`,
    [id, String(githubUser.id), githubUser.login, githubUser.email, role, now],
  );

  return rows[0];
}

export async function createSession(userId: string) {
  const token = `${randomUUID()}.${randomBytes(32).toString('hex')}`;
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const id = randomUUID();

  await query(
    `INSERT INTO "Session" (id, "userId", "tokenHash", "expiresAt", "createdAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, tokenHash, expiresAt, new Date()],
  );

  return { token, expiresAt, maxAge: SESSION_TTL_SECONDS };
}

export async function deleteSessionByToken(token: string) {
  await query(`DELETE FROM "Session" WHERE "tokenHash" = $1`, [hashToken(token)]);
}

export async function getUserBySessionToken(token: string | undefined) {
  if (!token) return null;

  const sessions = await query<SessionRow>(
    `SELECT id, "userId", "tokenHash", "expiresAt"
     FROM "Session"
     WHERE "tokenHash" = $1`,
    [hashToken(token)],
  );

  const session = sessions[0];
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await query(`DELETE FROM "Session" WHERE id = $1`, [session.id]);
    return null;
  }

  const users = await query<UserRow>(
    `SELECT id, "githubId", "githubLogin", email, role
     FROM "User"
     WHERE id = $1`,
    [session.userId],
  );

  const user = users[0];
  if (!user) return null;

  return toAuthUser(user);
}

export function isDeveloperRole(role: UserRole) {
  return role === 'DEVELOPER' || role === 'ADMIN';
}

export function canEditProfile(role: UserRole) {
  return isDeveloperRole(role);
}

export function parseSessionCookie(cookieHeader: string | undefined) {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      return rest.join('=');
    }
  }

  return undefined;
}

export function buildSessionCookie(token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function buildClearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
