import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Tone classes lifted verbatim from the pre-existing STATUS_BADGE/ACCOUNT_BADGE
 * maps in AdminAgentsListPage.tsx - this is a pure extraction, pixel-identical.
 */
export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
  {
    variants: {
      tone: {
        success: 'border-primary/30 bg-primary/15 text-primary',
        warning: 'border-gold/30 bg-gold/15 text-gold',
        danger:  'border-destructive/30 bg-destructive/15 text-destructive',
        neutral: 'border-border/60 bg-muted/60 text-muted-foreground',
        info:    'border-accent/30 bg-accent/15 text-accent',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, className }))} {...props} />
}
