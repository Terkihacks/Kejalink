import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** Custom form/content body. When omitted, only `description` is shown. */
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  confirmVariant?: 'default' | 'destructive'
  isConfirming?: boolean
  /** Hide the built-in confirm/cancel footer - useful when `children` is a self-contained form. */
  hideFooter?: boolean
}

/**
 * Centered modal dialog. Portal-rendered, Escape + backdrop-click to close,
 * body-scroll-lock while open (same mechanics as Navbar.tsx's mobile drawer).
 */
export function ConfirmDialog({
  open, onClose, title, description, children,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm,
  confirmVariant = 'default', isConfirming, hideFooter,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        {children && <div className="mt-4">{children}</div>}

        {!hideFooter && (
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isConfirming}>
              {cancelLabel}
            </Button>
            <Button
              ref={confirmRef}
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={isConfirming}
              className={cn(isConfirming && 'opacity-70')}
            >
              {isConfirming ? 'Please wait…' : confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
