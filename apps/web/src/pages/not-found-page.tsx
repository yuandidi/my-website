import { Link } from 'react-router-dom'
import { WEB_ROUTES } from '@my-blog/shared'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <FantasyScroll innerClassName="text-center">
        <p className="font-display text-5xl text-gold">404</p>
        <h1 className="mt-3 font-display text-xl">这片迷雾中似乎没有路…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          卷轴消散了，或是你误入了未开启的秘境
        </p>
      </FantasyScroll>
      <Button asChild>
        <Link to={WEB_ROUTES.home}>回到小屋</Link>
      </Button>
    </div>
  )
}
