import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const { data: categories } = useCategories()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          My Blog
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            全部
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
