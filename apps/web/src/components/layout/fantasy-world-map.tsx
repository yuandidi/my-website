import { Home, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import {
  getHotspotHref,
  WORLD_HOTSPOTS,
  type WorldHotspot,
} from '@/lib/world-map'
import { cn } from '@/lib/utils'

interface WorldMapHotspotProps {
  spot: WorldHotspot
}

function WorldMapHotspot({ spot }: WorldMapHotspotProps) {
  const href = getHotspotHref(spot)

  return (
    <Link
      to={href}
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      aria-label={
        spot.kind === 'hut' ? `${spot.label}，查看主人档案` : `进入${spot.label}`
      }
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-none border-2 font-pixel transition-colors fantasy-pixel-shadow-sm',
          spot.kind === 'hut'
            ? 'border-gold bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border-gold/80 bg-gold/90 text-gold-foreground hover:bg-gold',
        )}
      >
        {spot.kind === 'hut' ? (
          <Home className="size-4" aria-hidden />
        ) : (
          <MapPin className="size-4" aria-hidden />
        )}
      </span>
      <span className="rounded-none border-2 border-gold/30 bg-card/95 px-2 py-0.5 font-pixel text-xs text-foreground fantasy-pixel-shadow-sm">
        {spot.label}
      </span>
    </Link>
  )
}

interface FantasyWorldMapProps {
  className?: string
}

export function FantasyWorldMap({ className }: FantasyWorldMapProps) {
  return (
    <section className={cn('space-y-4', className)} aria-labelledby="world-map-title">
      <div>
        <h2
          id="world-map-title"
          className="fantasy-section-divider font-display text-2xl text-gold"
        >
          大陆纲要
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          点击领地探索卷轴；小屋是你的据点
        </p>
      </div>

      <FantasyScroll innerClassName="p-0 sm:p-0">
        <div className="relative aspect-[2.4/1] w-full overflow-hidden">
          <img
            src="/world-map.png"
            alt=""
            className="size-full object-cover object-center opacity-95 image-pixelated dark:opacity-50 dark:brightness-75"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card to-transparent dark:from-card"
            aria-hidden
          />

          {WORLD_HOTSPOTS.map((spot) => (
            <WorldMapHotspot key={spot.id} spot={spot} />
          ))}
        </div>
      </FantasyScroll>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="领地快捷入口">
        {WORLD_HOTSPOTS.map((spot) => (
          <Link
            key={spot.id}
            to={getHotspotHref(spot)}
            className="rounded-none border-2 border-gold/40 bg-card px-3 py-1 font-pixel text-muted-foreground transition-colors hover:border-gold hover:text-gold fantasy-pixel-shadow-sm"
          >
            {spot.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
