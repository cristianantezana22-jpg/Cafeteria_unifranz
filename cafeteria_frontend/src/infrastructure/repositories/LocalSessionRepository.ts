import type { SessionRepository } from '../../application/services/SessionRepository'
import type { CashierSession, UserRole } from '../../domain/models'

const SESSION_KEY = 'cafeteria.cashier-session'
const USER_ROLES: UserRole[] = ['CAJERO']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCashierSession(value: unknown): value is CashierSession {
  if (!isRecord(value)) return false

  const user = value.user
  if (!isRecord(user)) return false

  return (
    typeof value.token === 'string' &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    USER_ROLES.some((role) => role === value.role)
  )
}

// En el servidor (SSR) no existe window ni localStorage.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export class LocalSessionRepository implements SessionRepository {
  get(): CashierSession | null {
    const storage = getStorage()
    if (!storage) return null

    const stored = storage.getItem(SESSION_KEY)
    if (!stored) return null

    try {
      const session: unknown = JSON.parse(stored)
      if (isCashierSession(session)) return session
      this.clear()
      return null
    } catch {
      this.clear()
      return null
    }
  }

  save(session: CashierSession): void {
    getStorage()?.setItem(SESSION_KEY, JSON.stringify(session))
  }

  clear(): void {
    getStorage()?.removeItem(SESSION_KEY)
  }
}