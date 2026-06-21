export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
  theme: string
}

export function getGiscusConfig(): GiscusConfig | null {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO?.trim()
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim()
  const category =
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim() ?? 'General'
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim()
  const theme =
    process.env.NEXT_PUBLIC_GISCUS_THEME?.trim() ??
    'preferred_color_scheme'

  if (!repo || !repoId || !categoryId) {
    return null
  }

  return {
    repo,
    repoId,
    category,
    categoryId,
    theme,
  }
}

export function isGiscusEnabled(): boolean {
  return getGiscusConfig() !== null
}
