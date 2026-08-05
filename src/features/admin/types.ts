import type { VerificationStatus, AccountStatus } from '@/features/agent/types'

export type AppealResolution = 'UNSUSPENDED' | 'DISMISSED' | 'DEACTIVATED'

export interface AdminSuspension {
  id:           string
  agentId:      string
  suspendedBy:  string
  reason:       string
  isActive:     boolean
  suspendedAt:  string
  appealText?:  string | null
  appealedAt?:  string | null
  escalated?:   boolean
  resolution?:  AppealResolution | null
  resolvedBy?:  string | null
  resolvedAt?:  string | null
}

export interface AdminAgentListItem {
  id:                 string
  name:               string
  phone:              string
  serviceAreas:        string[]
  propertyTypes:       string[]
  verificationStatus:  VerificationStatus
  accountStatus:       AccountStatus
  createdAt:           string
  /** Observed null in practice even for VERIFIED agents - don't assume it's populated. */
  verification:        { status: VerificationStatus; reviewedAt: string | null } | null
  suspensions:         AdminSuspension[]
}

export interface AdminAgentDetail extends AdminAgentListItem {
  user:      { id: string; phone: string; name: string | null; isActive: boolean }
  deletedAt: string | null
  verification: {
    status:              VerificationStatus
    reviewedAt:          string | null
    isIdReadable:        boolean | null
    isFaceMatching:      boolean | null
    isLivenessConfirmed: boolean | null
    isEcitizenVerified:  boolean | null
  } | null
}

export interface AdminAgentListParams {
  verificationStatus?: VerificationStatus
  accountStatus?:      AccountStatus
  search?:             string
}

/** GET /admin/verifications queue item - pending/under-review agent with doc URLs. */
export interface VerificationQueueItem {
  id:                  string
  agentId:             string
  status:              VerificationStatus
  isIdReadable:        boolean | null
  isFaceMatching:      boolean | null
  isLivenessConfirmed: boolean | null
  isEcitizenVerified:  boolean | null
  isSocialMediaValid:  boolean | null
  reviewedBy:          string | null
  reviewedAt:          string | null
  rejectionReason:     string | null
  reapplyAllowedAt:    string | null
  createdAt:           string
  updatedAt:           string
  agent: {
    id:                 string
    name:               string
    phone:              string
    /** Present on the list endpoint, absent on the single-agent detail endpoint. */
    serviceAreas?:      string[]
    createdAt?:         string
    idFrontPhotoUrl:    string | null
    idBackPhotoUrl:     string | null
    livenessVideoUrl:   string | null
    livenessCode:       string | null
    ecitizenIdNumber:   string | null
    socialMediaUrl:     string | null
    verificationStatus: VerificationStatus
  }
}

export interface VerificationApproveInput {
  isIdReadable:        boolean
  isFaceMatching:      boolean
  isLivenessConfirmed: boolean
  isEcitizenVerified:  boolean
  isSocialMediaValid?: boolean
}

/** Approve/reject don't return a bare {message} - they return this agent summary. */
export interface AgentStatusSummary {
  id:                  string
  name:                string
  verificationStatus?: VerificationStatus
  accountStatus?:      AccountStatus
}
