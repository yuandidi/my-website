'use client'

import type { Tag } from '@my-blog/shared'
import { Button } from '@/components/ui/button'

interface PostTagFilterProps {
  tags: Tag[]
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}

export function PostTagFilter({
  tags,
  selectedSlug,
  onSelect,
}: PostTagFilterProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={selectedSlug === null ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
      >
        全部
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag.id}
          type="button"
          size="sm"
          variant={selectedSlug === tag.slug ? 'default' : 'outline'}
          onClick={() => onSelect(tag.slug)}
        >
          {tag.name}
        </Button>
      ))}
    </div>
  )
}
