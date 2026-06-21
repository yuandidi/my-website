'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AdminPostDetail, PostStatus } from '@my-blog/shared'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAdminPost, usePostMutations } from '@/hooks/useAdminPosts'
import { useTags } from '@/hooks/usePosts'

interface PostEditFormProps {
  mode: 'create' | 'edit'
  initialPost?: AdminPostDetail
}

function PostEditForm({ mode, initialPost }: PostEditFormProps) {
  const router = useRouter()
  const { data: tags } = useTags()
  const { createPost, updatePost } = usePostMutations()

  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [slug, setSlug] = useState(initialPost?.slug ?? '')
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '')
  const [content, setContent] = useState(initialPost?.content ?? '')
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? '')
  const [status, setStatus] = useState<PostStatus>(initialPost?.status ?? 'DRAFT')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialPost?.tagIds ?? [],
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isPending = createPost.isPending || updatePost.isPending

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  function handleSave() {
    setErrorMessage(null)

    const payload = {
      title,
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || null,
      content,
      coverImage: coverImage.trim() || null,
      status,
      tagIds: selectedTagIds,
    }

    if (mode === 'create') {
      createPost.mutate(payload, {
        onSuccess: () => {
          router.replace(WEB_ROUTES.postsAdmin)
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : '创建失败')
        },
      })
      return
    }

    if (!initialPost) {
      return
    }

    updatePost.mutate(
      { slug: initialPost.slug, input: payload },
      {
        onSuccess: () => {
          router.replace(WEB_ROUTES.postsAdmin)
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : '保存失败')
        },
      },
    )
  }

  return (
    <FantasyScroll innerClassName="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-medium">标题</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Slug（留空则自动生成）</span>
        <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">摘要</span>
        <Textarea
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          rows={3}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">正文（Markdown）</span>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={16}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">封面图 URL</span>
        <Input
          value={coverImage}
          onChange={(event) => setCoverImage(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">状态</span>
        <select
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          value={status}
          onChange={(event) => setStatus(event.target.value as PostStatus)}
        >
          <option value="DRAFT">草稿</option>
          <option value="PUBLISHED">已发布</option>
        </select>
      </label>

      <div className="space-y-3">
        <span className="text-sm font-medium">标签</span>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => {
            const selected = selectedTagIds.includes(tag.id)
            return (
              <Button
                key={tag.id}
                type="button"
                size="sm"
                variant={selected ? 'default' : 'outline'}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Button>
            )
          })}
          {!tags?.length && (
            <p className="text-sm text-muted-foreground">暂无标签，可在文章管理页创建。</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={isPending} onClick={handleSave}>
          {isPending ? '保存中…' : mode === 'create' ? '创建' : '保存'}
        </Button>
        <Button asChild variant="outline">
          <Link href={WEB_ROUTES.postsAdmin}>取消</Link>
        </Button>
      </div>
    </FantasyScroll>
  )
}

interface PostEditPageProps {
  mode: 'create' | 'edit'
  slug?: string
}

export function PostEditPage({ mode, slug }: PostEditPageProps) {
  const { data: post, isLoading: postLoading } = useAdminPost(slug ?? '')
  const router = useRouter()

  useEffect(() => {
    if (mode === 'edit' && !postLoading && !post) {
      router.replace(WEB_ROUTES.postsAdmin)
    }
  }, [mode, post, postLoading, router])

  if (mode === 'edit' && postLoading) {
    return <p className="text-sm text-muted-foreground">加载中…</p>
  }

  if (mode === 'edit' && !post) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-gold">
          {mode === 'create' ? '新建文章' : '编辑文章'}
        </h2>
        {mode === 'edit' && post && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'outline'}>
              {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
            </Badge>
            <span className="text-sm text-muted-foreground">/{post.slug}</span>
          </div>
        )}
      </div>

      <PostEditForm
        key={post?.updatedAt ?? 'new'}
        mode={mode}
        initialPost={post}
      />
    </div>
  )
}
