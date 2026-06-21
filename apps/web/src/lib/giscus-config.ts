export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
}

export function getGiscusConfig(): GiscusConfig | null {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO?.trim()
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim()
  const category =
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim() ?? 'General'
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim()

  if (!repo || !repoId || !categoryId) {
    return null
  }

  return {
    repo,
    repoId,
    category,
    categoryId,
  }
}

export function isGiscusEnabled(): boolean {
  return getGiscusConfig() !== null
}
