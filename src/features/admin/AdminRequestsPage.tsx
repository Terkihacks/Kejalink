import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input, Badge, Table, Thead, Tbody, Tr, Th, Td, Skeleton, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAdminRequests } from '@/hooks'
import type { RequestStatus } from '@/types'

const STATUS_FILTERS: (RequestStatus | 'ALL')[] = ['ALL', 'OPEN', 'MATCHED', 'PENDING_SUPPLY', 'PENDING_REMATCH', 'CLOSED', 'CANCELLED', 'EXPIRED']

const STATUS_TONE: Record<RequestStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  OPEN:             'info',
  MATCHED:          'success',
  PENDING_SUPPLY:   'warning',
  PENDING_REMATCH:  'warning',
  CLOSED:           'neutral',
  CANCELLED:        'neutral',
  EXPIRED:          'danger',
}

/** Read-only - the API has no admin mutation endpoint for requests. */
export function AdminRequestsPage() {
  const [status, setStatus] = useState<RequestStatus | 'ALL'>('ALL')
  const [area, setArea] = useState('')

  const { data: requests = [], isLoading } = useAdminRequests({
    status: status === 'ALL' ? undefined : status,
    area:   area.trim() || undefined,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Requests</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">All renter requests, most recent first.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <Input value={area} onChange={e => setArea(e.target.value)} placeholder="Filter by area…" className="pl-9" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={cn(
              'rounded-full border-2 px-3 py-1 text-xs font-medium transition-all',
              status === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/60 bg-card text-foreground hover:border-primary/40',
            )}
          >
            {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : requests.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Renter</Th>
              <Th>Area</Th>
              <Th>Budget</Th>
              <Th>Bedrooms</Th>
              <Th>Timeline</Th>
              <Th>Status</Th>
              <Th>Matches</Th>
              <Th>Created</Th>
              <Th>Expires</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map(r => (
              <Tr key={r.id}>
                <Td>
                  <p className="font-medium">{r.renter.name}</p>
                  <p className="text-xs text-muted-foreground">{r.renter.phone}</p>
                </Td>
                <Td>{r.area}</Td>
                <Td className="whitespace-nowrap">KES {r.budgetMin.toLocaleString()}–{r.budgetMax.toLocaleString()}</Td>
                <Td>{r.bedrooms}</Td>
                <Td>{r.timeline.replace(/_/g, ' ')}</Td>
                <Td><Badge tone={STATUS_TONE[r.status]}>{r.status.replace(/_/g, ' ')}</Badge></Td>
                <Td>{r.matchedAgentCount}</Td>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</Td>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.expiresAt).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <EmptyState title="No requests found" description="Try adjusting your filters." />
      )}
    </div>
  )
}
