import { Link } from 'react-router-dom'
import type { Tag } from '@my-blog/shared'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { cn } from '@/lib/utils'

interface TagCloudProps {
  tags: Tag[]
  className?: string
}

export function TagCloud({ tags, className }: TagCloudProps) {
  return (
    <FantasyScroll className={cn(className)}>
      <h2 className="fantasy-section-divider font-display text-lg text-gold">
        标签
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} to={WEB_ROUTES.tag(tag.slug)}>
            <Badge variant="spell" className="cursor-pointer">
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </FantasyScroll>
  )
}
