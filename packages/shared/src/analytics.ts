export const ANALYTICS_EVENTS = [
  'page_view',
  'post_view',
  'tag_filter',
  'external_link_click',
  'world_map_click',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsEventProperties = Record<
  string,
  string | number | boolean | null
>;

export interface AnalyticsEventInput {
  event: AnalyticsEventName;
  path: string;
  properties?: AnalyticsEventProperties;
}

export interface TrackEventsPayload {
  sessionId: string;
  events: AnalyticsEventInput[];
}

export interface AnalyticsDailyStat {
  date: string;
  pageViews: number;
  uniqueSessions: number;
}

export interface AnalyticsSummary {
  period: { days: number; from: string; to: string };
  totals: {
    pageViews: number;
    uniqueSessions: number;
    postViews: number;
  };
  daily: AnalyticsDailyStat[];
  topPages: { path: string; views: number }[];
  topPosts: { slug: string; views: number }[];
  topTagFilters: { slug: string; clicks: number }[];
  topExternalLinks: { href: string; label: string; clicks: number }[];
}

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BATCH_SIZE = 50;
const MAX_PATH_LENGTH = 512;
const MAX_PROPERTY_KEYS = 20;
const MAX_STRING_PROPERTY_LENGTH = 500;

export function isPublicAnalyticsPath(pathname: string): boolean {
  if (!pathname.startsWith('/')) {
    return false;
  }

  if (pathname.startsWith('/admin')) {
    return false;
  }

  if (pathname === '/profile/edit') {
    return false;
  }

  if (pathname === '/' || pathname === '/blog' || pathname === '/profile') {
    return true;
  }

  if (pathname.startsWith('/posts/')) {
    return true;
  }

  if (pathname.startsWith('/tags/')) {
    return true;
  }

  return false;
}

function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return (
    typeof value === 'string' &&
    ANALYTICS_EVENTS.includes(value as AnalyticsEventName)
  );
}

function validateProperties(
  errors: string[],
  properties: unknown,
): AnalyticsEventProperties | undefined {
  if (properties === undefined) {
    return undefined;
  }

  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    errors.push('properties must be an object');
    return undefined;
  }

  const entries = Object.entries(properties as Record<string, unknown>);
  if (entries.length > MAX_PROPERTY_KEYS) {
    errors.push(`properties must have at most ${MAX_PROPERTY_KEYS} keys`);
    return undefined;
  }

  const normalized: AnalyticsEventProperties = {};

  for (const [key, value] of entries) {
    if (key.length < 1 || key.length > 64) {
      errors.push('property keys must be 1-64 characters');
      continue;
    }

    if (
      value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number'
    ) {
      normalized[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      normalized[key] = value.slice(0, MAX_STRING_PROPERTY_LENGTH);
      continue;
    }

    errors.push(`property "${key}" must be string, number, boolean, or null`);
  }

  return normalized;
}

function validateEventInput(
  errors: string[],
  value: unknown,
  index: number,
): AnalyticsEventInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`events[${index}] must be an object`);
    return null;
  }

  const raw = value as Record<string, unknown>;
  const event = raw.event;
  const path = raw.path;

  if (!isAnalyticsEventName(event)) {
    errors.push(`events[${index}].event is invalid`);
    return null;
  }

  if (typeof path !== 'string' || path.length < 1 || path.length > MAX_PATH_LENGTH) {
    errors.push(`events[${index}].path must be 1-${MAX_PATH_LENGTH} characters`);
    return null;
  }

  if (!isPublicAnalyticsPath(path)) {
    errors.push(`events[${index}].path must be a public page`);
    return null;
  }

  const properties = validateProperties(errors, raw.properties);

  return {
    event,
    path,
    properties,
  };
}

export function validateTrackEventsPayload(body: unknown): TrackEventsPayload {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be an object');
  }

  const raw = body as Record<string, unknown>;
  const sessionId =
    typeof raw.sessionId === 'string' ? raw.sessionId.trim() : '';

  if (!SESSION_ID_PATTERN.test(sessionId)) {
    errors.push('sessionId must be a valid UUID');
  }

  if (!Array.isArray(raw.events)) {
    errors.push('events must be an array');
  } else if (raw.events.length < 1) {
    errors.push('events must not be empty');
  } else if (raw.events.length > MAX_BATCH_SIZE) {
    errors.push(`events must be at most ${MAX_BATCH_SIZE} items`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  const events: AnalyticsEventInput[] = [];

  for (const [index, item] of (raw.events as unknown[]).entries()) {
    const event = validateEventInput(errors, item, index);
    if (event) {
      events.push(event);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  if (events.length === 0) {
    throw new Error('events must not be empty');
  }

  return { sessionId, events };
}
