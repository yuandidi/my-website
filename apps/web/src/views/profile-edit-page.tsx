'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProfileLink, SiteProfile } from '@my-blog/shared'
import { WEB_ROUTES } from '@my-blog/shared'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useSiteProfile } from '@/hooks/useSiteProfile'
import { api } from '@/lib/api'

function parseSkills(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function sanitizeLinks(links: ProfileLink[]) {
  return links
    .map((link) => ({
      label: link.label.trim(),
      href: link.href.trim(),
    }))
    .filter((link) => link.label && link.href)
}

interface ProfileEditFormProps {
  profile: SiteProfile
}

function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = useState(profile.name)
  const [title, setTitle] = useState(profile.title)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [bio, setBio] = useState(profile.bio)
  const [skillsText, setSkillsText] = useState(profile.skills.join(', '))
  const [links, setLinks] = useState<ProfileLink[]>(profile.links)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      api.updateProfile({
        name,
        title,
        avatarUrl,
        bio,
        skills: parseSkills(skillsText),
        links: sanitizeLinks(links),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      router.replace(`${WEB_ROUTES.profile}?saved=1`)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : '保存失败')
    },
  })

  function updateLink(index: number, field: keyof ProfileLink, value: string) {
    setLinks((current) =>
      current.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    )
  }

  function addLink() {
    setLinks((current) => [...current, { label: '', href: '' }])
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index))
  }

  return (
    <FantasyScroll innerClassName="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-medium">名字</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">头衔</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">头像 URL</span>
        <Input
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">简介（Markdown）</span>
        <Textarea value={bio} onChange={(event) => setBio(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">技能（逗号分隔）</span>
        <Input
          value={skillsText}
          onChange={(event) => setSkillsText(event.target.value)}
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">外链</span>
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            添加链接
          </Button>
        </div>
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="标签"
              value={link.label}
              onChange={(event) => updateLink(index, 'label', event.target.value)}
            />
            <Input
              placeholder="https://"
              value={link.href}
              onChange={(event) => updateLink(index, 'href', event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeLink(index)}
            >
              删除
            </Button>
          </div>
        ))}
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? '保存中…' : '保存'}
        </Button>
        <Button asChild variant="outline">
          <Link href={WEB_ROUTES.profile}>取消</Link>
        </Button>
      </div>
    </FantasyScroll>
  )
}

export function ProfileEditPage() {
  const { isDeveloper, isLoading: authLoading, login } = useAuth()
  const { data: profile, isLoading: profileLoading } = useSiteProfile()
  const router = useRouter()

  useEffect(() => {
    if (!profileLoading && !profile) {
      router.replace(WEB_ROUTES.profile)
    }
  }, [profile, profileLoading, router])

  if (authLoading || profileLoading) {
    return null
  }

  if (!isDeveloper) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <p className="text-muted-foreground">请先使用 GitHub 登录。</p>
        <Button onClick={login}>GitHub 登录</Button>
        <div>
          <Button asChild variant="outline">
            <Link href={WEB_ROUTES.profile}>返回关于页</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
          编辑资料
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          修改后将立即展示在关于页。
        </p>
      </div>

      <ProfileEditForm key={profile.updatedAt} profile={profile} />
    </div>
  )
}
