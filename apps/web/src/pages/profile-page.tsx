import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { SITE_PROFILE } from '@/lib/profile'

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
          小屋主人档案
        </h1>
        <p className="mt-3 text-muted-foreground">迪迪 · 秘密小屋的守卷人</p>
      </div>

      <FantasyScroll innerClassName="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <img
            src={SITE_PROFILE.avatar}
            alt=""
            className="size-24 rounded-none border-2 border-gold/50 image-pixelated fantasy-pixel-shadow"
          />
          <div className="space-y-1">
            <h2 className="font-display text-2xl text-gold">{SITE_PROFILE.name}</h2>
            <p className="text-muted-foreground">{SITE_PROFILE.title}</p>
          </div>
        </div>

        <div className="prose-fantasy">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{SITE_PROFILE.bio}</ReactMarkdown>
        </div>

        <div>
          <h3 className="font-display text-lg text-gold">习得咒文</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {SITE_PROFILE.skills.map((skill) => (
              <Badge key={skill} variant="spell">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {SITE_PROFILE.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {SITE_PROFILE.links.map((link) => (
              <Button key={link.href} asChild variant="outline">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
        )}
      </FantasyScroll>

      <FantasyScroll innerClassName="space-y-4">
        <h3 className="font-display text-lg text-gold">精选卷轴</h3>
        <ul className="space-y-3">
          {SITE_PROFILE.featuredPosts.map((post) => (
            <li key={post.slug}>
              <Link
                to={WEB_ROUTES.post(post.slug)}
                className="font-display text-foreground transition-colors hover:text-primary"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </FantasyScroll>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to={WEB_ROUTES.home}>回到大陆纲要</Link>
        </Button>
      </div>
    </div>
  )
}
