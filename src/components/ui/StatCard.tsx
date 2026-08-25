import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

interface StatCardProps {
  icon:        ReactNode
  label:       string
  value:       string | number
  tone?:       'success' | 'warning' | 'danger' | 'neutral' | 'info'
  /** Shows a pulsing dot next to the label - use for counts that need attention (e.g. pending items). */
  attention?:  boolean
  isLoading?:  boolean
  className?:  string
}

const TONE_ICON_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  success: 'bg-primary/15 text-primary',
  warning: 'bg-gold/15 text-gold',
  danger:  'bg-destructive/15 text-destructive',
  neutral: 'bg-muted/60 text-muted-foreground',
  info:    'bg-accent/15 text-accent',
}

export function StatCard({ icon, label, value, tone = 'neutral', attention, isLoading, className }: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn('rounded-2xl border border-border/60 bg-card p-5', className)}
    >
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', TONE_ICON_BG[tone])}>
          {icon}
        </div>
        {attention && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
        )}
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
