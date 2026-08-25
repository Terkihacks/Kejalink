import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks'
import type { AppNotification } from '@/types'

const RECENT_COUNT = 5

function referenceHref(notification: AppNotification): string | null {
  if (!notification.referenceId) return null
  switch (notification.referenceType) {
    case 'AGENT':        return `/admin/agents/${notification.referenceId}`
    case 'VERIFICATION':  return `/admin/verifications/${notification.referenceId}`
    default:              return null
  }
}

/** Bell + unread badge + dropdown of recent notifications. Role-agnostic - currently only mounted in AdminLayout. */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const notifications = data?.notifications.slice(0, RECENT_COUNT) ?? []
  const unreadCount = data?.unreadCount ?? 0

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const handleSelect = (notification: AppNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id)
    const href = referenceHref(notification)
    setOpen(false)
    if (href) navigate(href)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Bell className="h-4 w-4" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-60"
              >
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map(notification => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(notification)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 border-b border-border/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40',
                      !notification.isRead && 'bg-primary/5',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!notification.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
          )}
        </div>
      )}
    </div>
  )
}
