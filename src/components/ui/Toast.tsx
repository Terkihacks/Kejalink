import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'danger' | 'info'

interface ToastItem {
  id: string
  tone: ToastTone
  message: string
}

interface ToastCtx {
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

const TONE_ICON: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger:  XCircle,
  info:    Info,
}

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-primary/30 bg-card text-foreground [&_svg]:text-primary',
  danger:  'border-destructive/30 bg-card text-foreground [&_svg]:text-destructive',
  info:    'border-accent/30 bg-card text-foreground [&_svg]:text-accent',
}

const AUTO_DISMISS_MS = 4000

/** Mounted inside AdminLayout only - renter/agent flows keep their existing inline-banner convention. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, tone, message }])
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
          {toasts.map(toast => {
            const Icon = TONE_ICON[toast.tone]
            return (
              <div
                key={toast.id}
                role="status"
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl',
                  'animate-in fade-in slide-in-from-bottom-2',
                  TONE_CLASS[toast.tone],
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <p className="text-sm font-medium">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
