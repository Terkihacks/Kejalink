/** Nairobi neighbourhoods available for renter area selection. */
export { AREAS } from '@/lib/constants'

/** House type options - id maps to the API's numeric `bedrooms` field at submit time. */
export const HOUSE_TYPES = [
  { id: 'bedsitter', label: 'Bedsitter',  sub: 'Self-contained single room' },
  { id: '1br',       label: '1 Bedroom',  sub: 'Bedroom + separate living room' },
  { id: '2br',       label: '2 Bedroom',  sub: 'Two bedrooms + living room' },
] as const

/** Maps a HOUSE_TYPES id to the `bedrooms` count the API expects (0 = studio/bedsitter). */
export const BEDROOMS_BY_HOUSE_TYPE: Record<string, number> = {
  bedsitter: 0,
  '1br':     1,
  '2br':     2,
}

/** Move-urgency options - id is the exact RequestTimeline enum value the API expects. */
export const MOVE_TIMELINES = [
  { id: 'ASAP',            label: 'As Soon As Possible' },
  { id: 'WITHIN_1_MONTH',  label: 'Within a Month'      },
  { id: 'WITHIN_3_MONTHS', label: 'Within 3 Months'     },
] as const

/** Total number of form steps before submission. */
export const TOTAL_STEPS = 5

/** Budget slider bounds in KES. */
export const BUDGET_MIN = 5_000
export const BUDGET_MAX = 100_000
export const BUDGET_STEP = 1_000
export const BUDGET_MIN_DEFAULT = 10_000
export const BUDGET_DEFAULT = 25_000
