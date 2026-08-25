import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Thin native-element table wrappers. `Table` handles responsive overflow
 * by scrolling horizontally rather than swapping to a card layout below a
 * breakpoint - deliberately simpler, and consistent across all admin tables.
 */
export function Table({ className, children, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
      <table data-slot="table" className={cn('w-full text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function Thead({ className, ...props }: ComponentProps<'thead'>) {
  return <thead data-slot="table-head" className={cn('border-b border-border/60 bg-muted/30', className)} {...props} />
}

export function Tbody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('divide-y divide-border/60', className)} {...props} />
}

export function Tr({ className, ...props }: ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={cn('transition-colors hover:bg-muted/20', className)} {...props} />
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head-cell"
      className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  )
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('px-4 py-3 text-foreground', className)} {...props} />
}
