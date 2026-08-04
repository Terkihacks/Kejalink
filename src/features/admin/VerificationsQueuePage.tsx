import { Link } from 'react-router-dom'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { useVerificationsQueue } from '@/hooks'

export function VerificationsQueuePage() {
  const { data: queue = [], isLoading } = useVerificationsQueue()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Verification Queue</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Agents awaiting review, oldest first.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-5">
              <div className="h-4 w-1/3 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : queue.length > 0 ? (
        <div className="space-y-3">
          {queue.map(item => (
            <Link
              key={item.agentId}
              to={`/admin/verifications/${item.agentId}`}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-foreground">{item.agent.name}</p>
                <p className="text-sm text-muted-foreground">{item.agent.phone}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No agents pending verification.</p>
        </div>
      )}
    </div>
  )
}
