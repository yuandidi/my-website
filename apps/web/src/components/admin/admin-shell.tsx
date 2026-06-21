'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { WEB_ROUTES } from '@my-blog/shared'
import { AdminGate } from '@/components/admin/admin-gate'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: '文章',
    href: WEB_ROUTES.postsAdmin,
    isActive: (pathname: string) => pathname.startsWith('/admin/posts'),
  },
  {
    label: '数据',
    href: WEB_ROUTES.analyticsAdmin,
    isActive: (pathname: string) => pathname.startsWith('/admin/analytics'),
  },
  {
    label: '资料',
    href: WEB_ROUTES.adminProfile,
    isActive: (pathname: string) => pathname.startsWith('/admin/profile'),
  },
] as const

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-10">
        <aside className="shrink-0 lg:w-44">
          <h1 className="fantasy-section-divider text-2xl font-bold text-gold">
            管理面板
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">站点内容与数据</p>
          <nav
            className="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:gap-1"
            aria-label="管理面板导航"
          >
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'shrink-0 rounded-none px-3 py-2 text-sm font-medium transition-[color,transform,box-shadow,border-color]',
                    active
                      ? 'border-gold/50 bg-primary/15 text-gold'
                      : 'border-2 border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AdminGate>
  )
}
