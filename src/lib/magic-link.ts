/** Extracts the trailing token segment from a magicLink URL like "http://host/results/<token>". */
export function extractMagicLinkToken(magicLink: string): string | null {
  const match = magicLink.match(/\/results\/([^/?#]+)/)
  return match ? match[1] : null
}
