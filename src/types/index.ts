/**
 * Shared TypeScript types for the KejaLink application.
 *
 * Feature-specific types should live alongside their feature module.
 * Only types consumed by 2+ features or by the routing layer belong here.
 */

/* ─── Request domain ─────────────────────────────────────────────── */

export type RequestTimeline = 'ASAP' | 'WITHIN_1_MONTH' | 'WITHIN_3_MONTHS'

export type RequestStatus = 'OPEN' | 'MATCHED' | 'PENDING_SUPPLY' | 'PENDING_REMATCH' | 'CLOSED' | 'CANCELLED' | 'EXPIRED'

export type MatchStatus = 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export interface MatchedAgent {
  id:            string
  name:          string
  phone:         string
  bio:           string | null
  serviceAreas:  string[]
  propertyTypes: string[]
}

export interface RequestMatch {
  id:     string
  rank:   1 | 2
  status: MatchStatus
  agent:  MatchedAgent
}

/** Payload sent to POST /requests */
export interface CreateRequestInput {
  area:        string
  budgetMin:   number
  budgetMax:   number
  bedrooms:    number
  timeline:    RequestTimeline
}

/** Response from POST /requests */
export interface CreateRequestOutput {
  requestId:        string
  status:           'MATCHED' | 'PENDING_SUPPLY'
  magicLink:        string
  matchedAgentCount: number
}

/** Shape returned by GET /requests/:id and GET /results/:token (minus magicLink on the latter) */
export interface RequestResult {
  id:                string
  area:              string
  budgetMin:         number
  budgetMax:         number
  bedrooms:          number
  timeline:          RequestTimeline
  status:            RequestStatus
  matchedAgentCount: number
  expiresAt:         string
  createdAt:         string
  magicLink?:        string
  matches:           RequestMatch[]
}

/* ─── Notifications ──────────────────────────────────────────────── */

/** Named `AppNotification` to avoid shadowing the DOM `Notification` global. */
export interface AppNotification {
  id:            string
  recipientId:   string
  type:          string
  title:         string
  body:          string
  referenceId:   string | null
  referenceType: string | null
  isRead:        boolean
  readAt:        string | null
  createdAt:     string
}
