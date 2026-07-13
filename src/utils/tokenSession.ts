const TOKEN_STORAGE_KEY = 'ugs_lobby_token'
const TOKEN_EXPIRE_MS = 24 * 60 * 60 * 1000

interface StoredToken {
  token: string
  expiresAt: number
}

export function saveTokenToSession(token: string): void {
  const data: StoredToken = { token, expiresAt: Date.now() + TOKEN_EXPIRE_MS }
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data))
}

export function getTokenFromSession(): string | null {
  const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as StoredToken
    if (Date.now() > data.expiresAt) {
      clearTokenFromSession()
      return null
    }
    return data.token
  } catch {
    clearTokenFromSession()
    return null
  }
}

export function clearTokenFromSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}
