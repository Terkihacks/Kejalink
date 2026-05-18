/**
 * Shared TypeScript types for the KejaLink application.
 *
 * Feature-specific types should live alongside their feature module.
 * Only types consumed by 2+ features or by the routing layer belong here.
 */

/* ─── Form types ─────────────────────────────────────────────────── */

/** Data collected across the 5-step rental request form (local UI state) */
export interface RequestFormData {
  /** One or more selected Nairobi neighbourhoods */
  areas: string[]
  /**
   * Single-element array matching the Slider component's array API.
   * Value is the max monthly rent in KES, e.g. [25000].
   */
  budget: number[]
  /** House type identifier: "bedsitter" | "1br" | "2br" */
  houseType: string
  /** Move timeline identifier: "immediately" | "this-week" | "this-month" | "flexible" */
  moveTimeline: string
  /** Kenyan phone number — digits only, no country code, min 9 chars */
  phone: string
}

/* ─── API types ──────────────────────────────────────────────────── */

export type NotificationType =
  | 'agent_accepted'
  | 'house_found'
  | 'viewing_scheduled'

export type RequestStatus = 'pending' | 'active' | 'matched' | 'closed'

/** Payload sent to POST /api/requests */
export interface HouseRequestInput {
  areas:        string[]
  maxBudget:    number
  houseType:    string   // e.g. 'bedsitter' | '1br' | '2br'
  moveTimeline: string   // e.g. 'immediately' | 'this-week' | 'this-month' | 'flexible'
  phone:        string   // full E.164 format, e.g. '+254712345678'
}

/** Shape returned by POST /api/requests and GET /api/requests/:id */
export interface RequestRecord {
  id:                string
  status:            RequestStatus
  areas:             string[]
  maxBudget:         number
  houseType:         string
  houseTypeLabel:    string   // e.g. '1 Bedroom'
  moveTimeline:      string
  moveTimelineLabel: string   // e.g. 'This Month'
  phone:             string
  agentsReviewing:   number
  createdAt:         string   // ISO-8601
}

/** Agent notification returned by GET /api/requests/:id/notifications */
export interface AgentNotification {
  id:      number
  type:    NotificationType
  title:   string
  message: string
  time:    string
  avatar:  string   // single character shown in the avatar circle
  isNew:   boolean
}

/** Error shape the API returns for non-2xx responses */
export interface ApiErrorBody {
  message: string
  code?:   string
}
