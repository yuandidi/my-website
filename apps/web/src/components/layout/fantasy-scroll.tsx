import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FantasyScrollProps {
  children: ReactNode
  className?: string
  innerClassName?: string
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
