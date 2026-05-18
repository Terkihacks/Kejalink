/**
 * Request service — all API calls related to house requests.
 *
 * When VITE_API_BASE_URL is not set the module falls back to realistic
 * mock data so the UI remains fully functional without a backend.
 */

import { api, isMockMode } from '@/lib/api'
import type { HouseRequestInput, RequestRecord, AgentNotification } from '@/types'

/* ─── Mock data ──────────────────────────────────────────────────── */

const MOCK_RECORD: RequestRecord = {
  id:                'mock-req-001',
  status:            'active',
  areas:             ['Kilimani'],
  maxBudget:         25_000,
  houseType:         '1br',
  houseTypeLabel:    '1 Bedroom',
  moveTimeline:      'this-month',
  moveTimelineLabel: 'This Month',
  phone:             '+254712345678',
  agentsReviewing:   0,
  createdAt:         new Date().toISOString(),
}

// Notifications drip in over time — the service returns them all and
// the hook/component is responsible for filtering by arrival order.
const MOCK_NOTIFICATIONS: AgentNotification[] = [
  {
    id:      1,
    type:    'agent_accepted',
    title:   'Agent John accepted your request',
    message: 'Hi, I have a great 1BR in Kilimani, fully furnished, available now.',
    time:    '2 min ago',
    avatar:  'J',
    isNew:   true,
  },
  {
    id:      2,
    type:    'house_found',
    title:   'New house found matching your needs',
    message: 'A 1BR in Kilimani at KES 22,000/month — 5 min walk to Junction Mall.',
    time:    '5 min ago',
    avatar:  'K',
    isNew:   true,
  },
  {
    id:      3,
    type:    'viewing_scheduled',
    title:   'Viewing scheduled for tomorrow',
    message: 'Agent Mary has booked a viewing at 10am. Address will be shared on WhatsApp.',
    time:    '8 min ago',
    avatar:  'M',
    isNew:   false,
  },
]

/** Simulates a network delay in mock mode. */
function delay<T>(value: T, ms = 1_200): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

/* ─── Service functions ──────────────────────────────────────────── */

/**
 * Submit a new house request.
 * Returns the created RequestRecord including the assigned `id`.
 */
export async function submitRequest(input: HouseRequestInput): Promise<RequestRecord> {
  if (isMockMode) {
    const record: RequestRecord = {
      ...MOCK_RECORD,
      areas:          input.areas,
      maxBudget:      input.maxBudget,
      houseType:      input.houseType,
      moveTimeline:   input.moveTimeline,
      phone:          input.phone,
      agentsReviewing: 0,
      createdAt:      new Date().toISOString(),
    }
    return delay(record, 2_000)
  }

  return api.post<RequestRecord>('/api/requests', input)
}

/**
 * Fetch the latest state of a request (agent count, status, etc.).
 * Intended to be polled every few seconds.
 */
export async function getRequest(id: string): Promise<RequestRecord> {
  if (isMockMode) {
    // Simulate agentsReviewing growing over time (max 5)
    const elapsed = Date.now() - new Date(MOCK_RECORD.createdAt).getTime()
    const agentsReviewing = Math.min(Math.floor(elapsed / 4_000) + 1, 5)
    return delay({ ...MOCK_RECORD, id, agentsReviewing }, 400)
  }

  return api.get<RequestRecord>(`/api/requests/${id}`)
}

/**
 * Fetch agent notifications for a request.
 * Intended to be polled every 8–10 seconds.
 */
export async function getNotifications(id: string): Promise<AgentNotification[]> {
  if (isMockMode) {
    const elapsed = Date.now() - new Date(MOCK_RECORD.createdAt).getTime()
    // Drip feed: first notification after 6s, second after 12s, third after 20s
    const visible = MOCK_NOTIFICATIONS.filter((_, i) => elapsed >= (i + 1) * 6_000)
    return delay(visible, 300)
  }

  return api.get<AgentNotification[]>(`/api/requests/${id}/notifications`)
}
