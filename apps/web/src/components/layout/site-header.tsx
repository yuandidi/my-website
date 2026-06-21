'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WEB_ROUTES } from '@my-blog/shared'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { SiteSpirit } from '@/components/site-spirit'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const pathname = usePathname()
  const { user, isLoggedIn, login, logout, isLoading, isDeveloper } = useAuth()
  const isProfileRoute = pathname === WEB_ROUTES.profile

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full border-b-2 border-gold/40 bg-background/90 fantasy-pixel-shadow-sm backdrop-blur-md',
        'overflow-visible',
        className,
      )}
    >
      <div className="fantasy-header-ornament h-6 w-full" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Link
          href={WEB_ROUTES.profile}
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
            href={WEB_ROUTES.home}
            className={cn(
              'fantasy-nav-link',
              pathname === WEB_ROUTES.home && 'fantasy-nav-link-active',
            )}
          >
            首页
          </Link>
          <Link
            href={WEB_ROUTES.profile}
            className={cn(
              'fantasy-nav-link',
              isProfileRoute && 'fantasy-nav-link-active',
            )}
          >
            关于
          </Link>
          {isDeveloper && (
            <Link
              href={WEB_ROUTES.admin}
              className={cn(
                'fantasy-nav-link',
                pathname.startsWith('/admin') && 'fantasy-nav-link-active',
              )}
            >
              管理
            </Link>
          )}
          <Link
            href={WEB_ROUTES.search}
            className={cn(
              'fantasy-nav-link',
              pathname === WEB_ROUTES.search && 'fantasy-nav-link-active',
            )}
          >
            搜索
          </Link>
          <Link
            href={WEB_ROUTES.blog}
            className={cn(
              'fantasy-nav-link',
              pathname === WEB_ROUTES.blog && 'fantasy-nav-link-active',
            )}
          >
            Blog
          </Link>
          {!isLoading &&
            (isLoggedIn ? (
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
            ))}
        </nav>
      </div>
      <div className="fantasy-header-ornament h-4 w-full opacity-35" aria-hidden />
      <SiteSpirit />
    </header>
  )
}
