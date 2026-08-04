import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldOff, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminAgent, useSuspendAgent, useUnsuspendAgent } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'

export function AdminAgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: agent, isLoading } = useAdminAgent(id)
  const suspendAgent   = useSuspendAgent()
  const unsuspendAgent = useUnsuspendAgent()

  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [reason, setReason] = useState('')

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.5} />
  if (!agent) return null

  const isSuspended = agent.accountStatus === 'SUSPENDED'
  const activeSuspension = agent.suspensions.find(s => s.isActive)

  const handleSuspend = () => {
    if (!id || reason.trim().length < 10) return
    suspendAgent.mutate({ id, reason: reason.trim() }, { onSuccess: () => setShowSuspendForm(false) })
  }

  const handleUnsuspend = () => {
    if (!id) return
    unsuspendAgent.mutate(id)
  }

  return (
    <div>
      <Link to="/admin/agents" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to agents
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{agent.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{agent.phone}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Verification</p>
          <p className="mt-1 font-semibold text-foreground">{agent.verificationStatus.replace('_', ' ')}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Account</p>
          <p className="mt-1 font-semibold text-foreground">{agent.accountStatus}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="mb-3 font-semibold text-foreground">Service Areas</h3>
        <div className="flex flex-wrap gap-2">
          {agent.serviceAreas.map(area => (
            <span key={area} className="rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-foreground">{area}</span>
          ))}
        </div>
      </div>

      {(suspendAgent.isError || unsuspendAgent.isError) && (
        <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
          <p className="text-sm font-medium text-destructive">{getErrorMessage(suspendAgent.error ?? unsuspendAgent.error)}</p>
        </div>
      )}

      {isSuspended ? (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm font-medium text-foreground">This account is suspended.</p>
          {activeSuspension && <p className="mt-1 text-sm text-muted-foreground">Reason: {activeSuspension.reason}</p>}
          <button
            type="button"
            onClick={handleUnsuspend}
            disabled={unsuspendAgent.isPending}
            className="mt-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
            Unsuspend
          </button>
        </div>
      ) : showSuspendForm ? (
        <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Suspend Agent</h3>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for suspension (min 10 characters)…"
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSuspend}
              disabled={reason.trim().length < 10 || suspendAgent.isPending}
              className={cn(
                'flex-1 rounded-full py-2.5 text-sm font-semibold transition-all',
                reason.trim().length >= 10 && !suspendAgent.isPending
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
              )}
            >
              Confirm Suspension
            </button>
            <button
              type="button"
              onClick={() => setShowSuspendForm(false)}
              className="flex-1 rounded-full border border-border/60 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSuspendForm(true)}
          className="mb-6 flex items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
        >
          <ShieldOff className="h-4 w-4" strokeWidth={1.5} />
          Suspend Agent
        </button>
      )}

      {agent.suspensions.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Suspension History</h3>
          <div className="space-y-3">
            {agent.suspensions.map(s => (
              <div key={s.id} className="rounded-xl bg-secondary/40 p-3 text-sm">
                <p className="text-foreground">{s.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(s.suspendedAt).toLocaleDateString()} {s.isActive ? '· Active' : s.resolution ? `· Resolved: ${s.resolution}` : '· Lifted'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
