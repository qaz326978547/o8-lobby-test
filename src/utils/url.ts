export function resolveIconUrl(iconurl: string | null | undefined): string {
  if (!iconurl) return ''
  if (iconurl.startsWith('//')) return `https:${iconurl}`
  return iconurl
}

const GAME_CARD_FALLBACK_IMAGES = [
  '/assets/images/games/GameCard-1.png',
  '/assets/images/games/GameCard-2.png',
  '/assets/images/games/GameCard-3.png',
  '/assets/images/games/GameCard-4.png',
]

export function resolveGameImagePath(iconurl: string | null | undefined, idx: number): string {
  const resolved = resolveIconUrl(iconurl)
  if (resolved) return resolved
  const images = GAME_CARD_FALLBACK_IMAGES
  return images[idx % images.length] ?? images[0] ?? '/assets/images/games/GameCard-1.png'
}
