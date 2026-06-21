const DEFAULT_SITE_URL = 'http://localhost:3000';

/** 读取 SITE_URL，用于 RSS、sitemap、Metadata 等静态生成场景 */
export function getConfiguredSiteUrl(): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return DEFAULT_SITE_URL;
}
