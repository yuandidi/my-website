import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FantasyScrollProps {
  children: ReactNode
  className?: string
  innerClassName?: string
}

function PixelCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <span
      className={cn('fantasy-pixel-corner pointer-events-none', {
        'fantasy-pixel-corner-tl': position === 'tl',
        'fantasy-pixel-corner-tr': position === 'tr',
        'fantasy-pixel-corner-bl': position === 'bl',
        'fantasy-pixel-corner-br': position === 'br',
      })}
      aria-hidden
    />
  )
}

export function FantasyScroll({
  children,
  className,
  innerClassName,
}: FantasyScrollProps) {
  return (
    <div
      className={cn(
        'fantasy-scroll fantasy-pixel-panel fantasy-pixel-grain relative bg-card',
        className,
      )}
    >
      <PixelCorner position="tl" />
      <PixelCorner position="tr" />
      <PixelCorner position="bl" />
      <PixelCorner position="br" />
      <div
        className={cn(
          'relative border border-gold/25 bg-gradient-to-b from-transparent to-primary/5 px-5 py-5 sm:px-6 sm:py-6',
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
