/**
 * Role-agnostic notification endpoints - GET /notifications, mark-read, mark-all-read.
 * Defaults to the admin session but accepts any SessionKind so Agent/Renter shells
 * can adopt this same service later.
 */

import { api, isMockMode } from '@/lib/api'
import type { SessionKind } from '@/lib/auth-storage'
import type { AppNotification } from '@/types'

export interface ListNotificationsResult {
  notifications: AppNotification[]
  unreadCount:   number
}

export interface ListNotificationsParams {
  unreadOnly?: boolean
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'mock-notif-001', recipientId: 'mock-admin-001', type: 'VERIFICATION_PENDING',
    title: 'New verification submitted', body: 'Kevin Otieno submitted documents for review.',
    referenceId: 'mock-agent-002', referenceType: 'AGENT', isRead: false, readAt: null,
    createdAt: new Date().toISOString(),
  },
]

export async function listNotifications(params: ListNotificationsParams = {}, auth: SessionKind = 'admin'): Promise<ListNotificationsResult> {
  if (isMockMode) {
    const notifications = params.unreadOnly ? MOCK_NOTIFICATIONS.filter(n => !n.isRead) : MOCK_NOTIFICATIONS
    return delay({ notifications, unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length })
  }
  const qs = params.unreadOnly ? '?unreadOnly=true' : ''
  return api.get<ListNotificationsResult>(`/notifications${qs}`, auth)
}

export async function markNotificationRead(id: string, auth: SessionKind = 'admin'): Promise<{ message: string }> {
  if (isMockMode) return delay({ message: 'Notification marked as read' })
  return api.post<{ message: string }>(`/notifications/${id}/read`, {}, auth)
}

export async function markAllNotificationsRead(auth: SessionKind = 'admin'): Promise<{ message: string }> {
  if (isMockMode) return delay({ message: 'All notifications marked as read' })
  return api.post<{ message: string }>('/notifications/read-all', {}, auth)
}
