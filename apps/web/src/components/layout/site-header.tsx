import { Link, useLocation } from 'react-router-dom'
import { WEB_ROUTES } from '@my-blog/shared'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'
interface SiteHeaderProps {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const { data: categories } = useCategories()
  const { pathname } = useLocation()
  const { user, isLoggedIn, login, logout, isLoading } = useAuth()
  const isProfileRoute =
    pathname === WEB_ROUTES.profile || pathname === WEB_ROUTES.profileEdit
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b-2 border-gold/40 bg-background/90 fantasy-pixel-shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <div className="fantasy-header-ornament h-6 w-full" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Link
          to={WEB_ROUTES.profile}
          className="group flex items-center gap-2 font-display text-xl tracking-wide"
        >
          <img
            src="/favicon.png"
            alt=""
            className="size-8 rounded-none border-2 border-gold/50 transition-transform image-pixelated group-hover:scale-105"
            aria-hidden
          />
          <span className="fantasy-title">迪迪の秘密小屋</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link
            to={WEB_ROUTES.home}
            className={cn(
              'fantasy-nav-link',
              pathname === WEB_ROUTES.home && 'fantasy-nav-link-active',
            )}
          >
            首页
          </Link>
          <Link
            to={WEB_ROUTES.profile}
            className={cn(
              'fantasy-nav-link',
              isProfileRoute && 'fantasy-nav-link-active',
            )}
          >
            关于
          </Link>
          {categories?.map((category) => {
            const href = WEB_ROUTES.category(category.slug)
            return (
              <Link
                key={category.id}
                to={href}
                className={cn(
                  'fantasy-nav-link',
                  pathname === href && 'fantasy-nav-link-active',
                )}
              >
                {category.name}
              </Link>
            )
          })}
          {!isLoading && (
            isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-0 py-0 font-medium text-muted-foreground hover:text-gold"
                onClick={() => logout()}
              >
                退出 ({user?.githubLogin})
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-0 py-0 font-medium text-muted-foreground hover:text-gold"
                onClick={login}
              >
                登录
              </Button>
            )
          )}
        </nav>
      </div>
      <div className="fantasy-header-ornament h-4 w-full opacity-35" aria-hidden />
    </header>
  )
}
