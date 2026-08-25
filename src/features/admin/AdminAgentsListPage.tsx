import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { Input, Badge, type BadgeProps } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAdminAgents } from '@/hooks'
import type { VerificationStatus, AccountStatus } from '@/features/agent/types'

const VERIFICATION_FILTERS: (VerificationStatus | 'ALL')[] = ['ALL', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']

const STATUS_TONE: Record<VerificationStatus, BadgeProps['tone']> = {
  PENDING:      'warning',
  UNDER_REVIEW: 'warning',
  VERIFIED:     'success',
  REJECTED:     'danger',
}

const ACCOUNT_TONE: Record<AccountStatus, BadgeProps['tone']> = {
  ACTIVE:      'success',
  SUSPENDED:   'danger',
  DEACTIVATED: 'neutral',
}

export function AdminAgentsListPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VerificationStatus | 'ALL'>('ALL')

  const { data: agents = [], isLoading } = useAdminAgents({
    search: search.trim() || undefined,
    verificationStatus: filter === 'ALL' ? undefined : filter,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Agents</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Search and manage all registered agents.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…" className="pl-9" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {VERIFICATION_FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border-2 px-3 py-1 text-xs font-medium transition-all',
              filter === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/60 bg-card text-foreground hover:border-primary/40',
            )}
          >
            {f === 'ALL' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-5">
              <div className="h-4 w-1/3 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="space-y-3">
          {agents.map(agent => (
            <Link
              key={agent.id}
              to={`/admin/agents/${agent.id}`}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-foreground">{agent.name}</p>
                <p className="text-sm text-muted-foreground">{agent.phone}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone={STATUS_TONE[agent.verificationStatus]}>{agent.verificationStatus.replace('_', ' ')}</Badge>
                  <Badge tone={ACCOUNT_TONE[agent.accountStatus]}>{agent.accountStatus}</Badge>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No agents match your search.</p>
        </div>
      )}
    </div>
  )
}
