import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'input'
    return (
      <Comp
        type={type}
        className={cn(
          'flex h-9 w-full rounded-none border-2 border-gold/40 bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground fantasy-focus disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
