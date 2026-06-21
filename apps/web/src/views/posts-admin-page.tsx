'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { Input } from '@/components/ui/input'
import {
  useAdminPosts,
  usePostMutations,
  useTaxonomyMutations,
} from '@/hooks/useAdminPosts'
import { useTags } from '@/hooks/usePosts'

export function PostsAdminPage() {
  const { data: posts, isLoading: postsLoading } = useAdminPosts({ page: 1, limit: 50 })
  const { data: tags } = useTags()
  const { deletePost } = usePostMutations()
  const { createTag, deleteTag } = useTaxonomyMutations()

  const [tagName, setTagName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (postsLoading) {
    return <p className="text-sm text-muted-foreground">加载中…</p>
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-gold">文章</h2>
          <p className="mt-1 text-sm text-muted-foreground">管理文章与标签</p>
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

      <FantasyScroll innerClassName="space-y-4">
        <h3 className="text-lg font-semibold text-gold">标签</h3>
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

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
