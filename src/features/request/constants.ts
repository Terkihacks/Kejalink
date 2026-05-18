/** Nairobi neighbourhoods available for renter area selection. */
export const AREAS = [
  'Westlands', 'Kilimani', 'South B', 'South C', 'Kileleshwa',
  'Lavington', 'Ngong Road', "Lang'ata", 'Karen', 'Kasarani',
  'Roysambu', 'Thika Road', 'Eastleigh', 'Embakasi', 'Donholm',
] as const

/** House type options — id is stored in form state, label is shown in UI. */
export const HOUSE_TYPES = [
  { id: 'bedsitter', label: 'Bedsitter',  sub: 'Self-contained single room' },
  { id: '1br',       label: '1 Bedroom',  sub: 'Bedroom + separate living room' },
  { id: '2br',       label: '2 Bedroom',  sub: 'Two bedrooms + living room' },
] as const

/** Move-urgency options shown as a 2×2 grid in step 4. */
export const MOVE_TIMELINES = [
  { id: 'immediately', label: 'Immediately' },
  { id: 'this-week',   label: 'This Week'   },
  { id: 'this-month',  label: 'This Month'  },
  { id: 'flexible',    label: 'Flexible'    },
] as const

/** Total number of form steps before submission. */
export const TOTAL_STEPS = 5

/** Budget slider bounds in KES. */
export const BUDGET_MIN = 5_000
export const BUDGET_MAX = 100_000
export const BUDGET_STEP = 1_000
export const BUDGET_DEFAULT = 15_000
