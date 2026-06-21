import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-none border-2 px-2.5 py-0.5 font-pixel text-xs font-medium transition-colors fantasy-pixel-shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-gold/40 bg-gold/15 text-gold-foreground hover:bg-gold/25',
        outline: 'border-gold/30 text-foreground',
        guild:
          'border-gold/50 bg-gold/20 text-gold-foreground hover:bg-gold/30',
        spell:
          'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
