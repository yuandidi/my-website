'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import {
  useAdminPosts,
  usePostMutations,
  useTaxonomyMutations,
} from '@/hooks/useAdminPosts'
import { useCategories, useTags } from '@/hooks/usePosts'

export function PostsAdminPage() {
  const { isDeveloper, isLoading: authLoading, login } = useAuth()
  const { data: posts, isLoading: postsLoading } = useAdminPosts({ page: 1, limit: 50 })
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const { deletePost } = usePostMutations()
  const {
    createCategory,
    deleteCategory,
    createTag,
    deleteTag,
  } = useTaxonomyMutations()

  const [categoryName, setCategoryName] = useState('')
  const [tagName, setTagName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (authLoading || postsLoading) {
    return null
  }

  if (!isDeveloper) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <p className="text-muted-foreground">请先使用 GitHub 登录。</p>
        <Button onClick={login}>GitHub 登录</Button>
        <div>
          <Button asChild variant="outline">
            <Link href={WEB_ROUTES.home}>返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  function handleCreateCategory() {
    const name = categoryName.trim()
    if (!name) return

    createCategory.mutate(
      { name },
      {
        onSuccess: () => setCategoryName(''),
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : '创建分类失败')
        },
      },
    )
  }

  function handleCreateTag() {
    const name = tagName.trim()
    if (!name) return

    createTag.mutate(
      { name },
      {
        onSuccess: () => setTagName(''),
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : '创建标签失败')
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
            文章管理
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            管理文章、分类与标签。仅开发者可见。
          </p>
        </div>
        <Button asChild>
          <Link href={WEB_ROUTES.postNew}>新建文章</Link>
        </Button>
      </div>

      <FantasyScroll innerClassName="space-y-4">
        {!posts?.data.length ? (
          <p className="text-sm text-muted-foreground">暂无文章，点击「新建文章」开始写作。</p>
        ) : (
          posts.data.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{post.title}</span>
                  <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'outline'}>
                    {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">/{post.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.status === 'PUBLISHED' && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={WEB_ROUTES.post(post.slug)}>查看</Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={WEB_ROUTES.postEdit(post.slug)}>编辑</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deletePost.isPending}
                  onClick={() => {
                    if (window.confirm(`确定删除「${post.title}」？`)) {
                      deletePost.mutate(post.slug)
                    }
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </FantasyScroll>

      <div className="grid gap-6 md:grid-cols-2">
        <FantasyScroll innerClassName="space-y-4">
          <h2 className="text-lg font-semibold text-gold">分类</h2>
          <div className="flex gap-2">
            <Input
              placeholder="新分类名称"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
            />
            <Button
              type="button"
              disabled={createCategory.isPending}
              onClick={handleCreateCategory}
            >
              添加
            </Button>
          </div>
          <div className="space-y-2">
            {categories?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  {category.name}{' '}
                  <span className="text-muted-foreground">/{category.slug}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleteCategory.isPending}
                  onClick={() => {
                    if (window.confirm(`确定删除分类「${category.name}」？`)) {
                      deleteCategory.mutate(category.slug)
                    }
                  }}
                >
                  删除
                </Button>
              </div>
            ))}
            {!categories?.length && (
              <p className="text-sm text-muted-foreground">暂无分类</p>
            )}
          </div>
        </FantasyScroll>

        <FantasyScroll innerClassName="space-y-4">
          <h2 className="text-lg font-semibold text-gold">标签</h2>
          <div className="flex gap-2">
            <Input
              placeholder="新标签名称"
              value={tagName}
              onChange={(event) => setTagName(event.target.value)}
            />
            <Button
              type="button"
              disabled={createTag.isPending}
              onClick={handleCreateTag}
            >
              添加
            </Button>
          </div>
          <div className="space-y-2">
            {tags?.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  {tag.name}{' '}
                  <span className="text-muted-foreground">/{tag.slug}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleteTag.isPending}
                  onClick={() => {
                    if (window.confirm(`确定删除标签「${tag.name}」？`)) {
                      deleteTag.mutate(tag.slug)
                    }
                  }}
                >
                  删除
                </Button>
              </div>
            ))}
            {!tags?.length && (
              <p className="text-sm text-muted-foreground">暂无标签</p>
            )}
          </div>
        </FantasyScroll>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
