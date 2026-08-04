import { useState } from 'react'
import { Gavel, ArrowUpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthSession, useAdminAppeals, useEscalateAppeal, useResolveAppeal } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'
import type { AppealResolution } from './types'

const RESOLUTIONS: AppealResolution[] = ['UNSUSPENDED', 'DISMISSED', 'DEACTIVATED']

export function AdminAppealsPage() {
  const session = useAuthSession('admin')
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'

  const { data: appeals = [], isLoading } = useAdminAppeals()
  const escalateAppeal = useEscalateAppeal()
  const resolveAppeal  = useResolveAppeal()
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Suspension Appeals</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Active suspensions where the agent has submitted an appeal.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-5">
              <div className="h-4 w-1/3 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : appeals.length > 0 ? (
        <div className="space-y-4">
          {appeals.map(appeal => (
            <div key={appeal.id} className="rounded-2xl border border-border/60 bg-card p-5">
              <p className="text-sm text-muted-foreground">Suspension reason</p>
              <p className="font-medium text-foreground">{appeal.reason}</p>

              {appeal.appealText && (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">Agent's appeal</p>
                  <p className="text-foreground">{appeal.appealText}</p>
                </>
              )}

              {(escalateAppeal.isError || resolveAppeal.isError) && (
                <p className="mt-3 text-sm font-medium text-destructive">
                  {getErrorMessage(escalateAppeal.error ?? resolveAppeal.error)}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!appeal.escalated && (
                  <button
                    type="button"
                    onClick={() => escalateAppeal.mutate(appeal.id)}
                    disabled={escalateAppeal.isPending}
                    className="flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArrowUpCircle className="h-4 w-4" strokeWidth={1.5} />
                    Escalate to Super Admin
                  </button>
                )}

                {/* Resolving is gated to SUPER_ADMIN — regular ADMIN can view + escalate only. */}
                {isSuperAdmin && (
                  resolvingId === appeal.id ? (
                    <div className="flex flex-wrap gap-2">
                      {RESOLUTIONS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => resolveAppeal.mutate({ id: appeal.id, resolution: r }, { onSuccess: () => setResolvingId(null) })}
                          disabled={resolveAppeal.isPending}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60',
                            r === 'UNSUSPENDED' && 'border-primary/40 text-primary hover:bg-primary/10',
                            r === 'DISMISSED' && 'border-border/60 text-foreground hover:bg-muted/40',
                            r === 'DEACTIVATED' && 'border-destructive/40 text-destructive hover:bg-destructive/10',
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResolvingId(appeal.id)}
                      className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      <Gavel className="h-4 w-4" strokeWidth={1.5} />
                      Resolve
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <Gavel className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No pending appeals.</p>
        </div>
      )}
    </div>
  )
}
