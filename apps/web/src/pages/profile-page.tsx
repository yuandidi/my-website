import { Link, useSearchParams } from 'react-router-dom'
import { MarkdownContent } from '@/components/blog/markdown-content'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useSiteProfile } from '@/hooks/useSiteProfile'
import { QueryError } from '@/components/blog/post-list-states'

export function ProfilePage() {
  const { user, isLoggedIn, isDeveloper, login } = useAuth()
  const { data: profile, isLoading, isError, error, refetch } = useSiteProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const saved = searchParams.get('saved') === '1'

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <QueryError
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
            关于
          </h1>
          <p className="mt-3 text-muted-foreground">{profile.title}</p>
        </div>
        {isDeveloper ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={WEB_ROUTES.postsAdmin}>管理文章</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={WEB_ROUTES.profileEdit}>编辑资料</Link>
            </Button>
          </div>
        ) : !isLoggedIn ? (
          <Button variant="outline" size="sm" onClick={login}>
            GitHub 登录
          </Button>
        ) : null}
      </div>

      {saved && (
        <p className="rounded-none border-2 border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          资料已保存。
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setSearchParams({})}
          >
            知道了
          </button>
        </p>
      )}

      {isLoggedIn && !isDeveloper && (
        <p className="text-sm text-muted-foreground">
          已以 {user?.githubLogin} 登录
        </p>
      )}

      <FantasyScroll innerClassName="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <img
            src={profile.avatarUrl}
            alt=""
            className="size-24 rounded-none border-2 border-gold/50 image-pixelated fantasy-pixel-shadow"
          />
          <div className="space-y-1">
            <h2 className="font-display text-2xl text-gold">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.title}</p>
          </div>
        </div>

        <div className="prose-fantasy">
          <MarkdownContent content={profile.bio} />
        </div>

        <div>
          <h3 className="font-display text-lg text-gold">技能</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="spell">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {profile.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {profile.links.map((link) => (
              <Button key={link.href} asChild variant="outline">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
        )}
      </FantasyScroll>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to={WEB_ROUTES.home}>返回首页</Link>
        </Button>
      </div>
    </div>
  )
}
