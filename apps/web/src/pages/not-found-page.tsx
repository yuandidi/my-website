import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">页面不存在或已被移除</p>
      <Button asChild>
        <Link to="/">返回首页</Link>
      </Button>
    </div>
  )
}
