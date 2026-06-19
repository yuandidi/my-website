import { Link } from 'react-router-dom'
import type { Tag } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TagCloudProps {
  tags: Tag[]
  className?: string
}

export function TagCloud({ tags, className }: TagCloudProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">标签</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} to={`/tags/${tag.slug}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              {tag.name}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
