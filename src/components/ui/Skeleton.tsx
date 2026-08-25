import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Pulsing placeholder block for loading states. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-lg bg-muted/60', className)}
      {...props}
    />
  )
}
