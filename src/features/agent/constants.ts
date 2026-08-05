/**
 * Property type options for the agent apply form's `propertyTypes` field.
 * The API gives no enum for this - its own example payload uses "apartment"
 * and "studio", so this list rounds that out with common Kenyan rental
 * categories.
 */
export const PROPERTY_TYPES = [
  'bedsitter', 'studio', 'apartment', 'maisonette', 'townhouse', 'bungalow', 'gated-community',
] as const

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'bedsitter':       'Bedsitter',
  'studio':          'Studio',
  'apartment':       'Apartment',
  'maisonette':      'Maisonette',
  'townhouse':       'Townhouse',
  'bungalow':        'Bungalow',
  'gated-community': 'Gated Community',
}
