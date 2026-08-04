export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
export type LeadStatus = 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

/** Payload for POST /agents/apply and PATCH /agents/me (all optional on PATCH). */
export interface AgentApplyInput {
  name:              string
  bio?:              string
  serviceAreas:      string[]
  propertyTypes:     string[]
  idFrontPhotoUrl?:  string
  idBackPhotoUrl?:   string
  livenessVideoUrl?: string
  ecitizenIdNumber?: string
  socialMediaUrl?:   string
}

export interface AgentVerificationChecklist {
  status:              VerificationStatus
  isIdReadable:        boolean | null
  isFaceMatching:      boolean | null
  isLivenessConfirmed: boolean | null
  isEcitizenVerified:  boolean | null
  isSocialMediaValid?: boolean | null
  rejectionReason?:    string | null
  reapplyAllowedAt?:   string | null
  reviewedAt?:         string | null
}

export interface AgentProfile {
  id:                   string
  userId:               string
  name:                 string
  phone:                string
  bio:                  string | null
  serviceAreas:         string[]
  propertyTypes:        string[]
  idFrontPhotoUrl:      string | null
  idBackPhotoUrl:       string | null
  livenessVideoUrl:     string | null
  livenessCode:         string | null
  livenessCodeExpiresAt: string | null
  ecitizenIdNumber:     string | null
  socialMediaUrl:       string | null
  verificationStatus:   VerificationStatus
  accountStatus:        AccountStatus
  createdAt:            string
  updatedAt:            string
  verification:         AgentVerificationChecklist | null
}

export interface AgentLeadRequestSummary {
  id:         string
  area:       string
  budgetMin:  number
  budgetMax:  number
  bedrooms:   number
  timeline:   string
  status:     string
  expiresAt:  string
}

export interface AgentLead {
  id:          string
  requestId:   string
  agentId:     string
  rank:        1 | 2
  status:      LeadStatus
  notifiedAt:  string
  respondedAt: string | null
  createdAt:   string
  updatedAt:   string
  request:     AgentLeadRequestSummary
}
