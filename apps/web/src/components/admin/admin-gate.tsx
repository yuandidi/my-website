'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { WEB_ROUTES } from '@my-blog/shared'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function AdminGate({ children }: { children: ReactNode }) {
  const { isDeveloper, isLoading, login } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isDeveloper) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <p className="text-muted-foreground">请先使用开发者账号登录。</p>
        <Button onClick={login}>GitHub 登录</Button>
        <div>
          <Button asChild variant="outline">
            <Link href={WEB_ROUTES.home}>返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  return children
}
