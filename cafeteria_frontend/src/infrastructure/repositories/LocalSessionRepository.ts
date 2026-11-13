import type { SessionRepository } from '../../application/services/SessionRepository'
import type { CustomerSession, UserRole } from '../../domain/models'

const SESSION_KEY = 'cafeteria.customer-session'
const USER_ROLES: UserRole[] = ['CLIENTE', 'CAJERO', 'ADMIN', 'PANTALLA']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCustomerSession(value: unknown): value is CustomerSession {
  if (!isRecord(value)) return false

  const customer = value.customer
  if (!isRecord(customer)) return false

  return (
    typeof value.token === 'string' &&
    typeof customer.id === 'string' &&
    typeof customer.name === 'string' &&
    typeof customer.email === 'string' &&
    USER_ROLES.some((role) => role === value.role)
  )
}

// En el servidor (SSR) no existe window ni localStorage.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export class LocalSessionRepository implements SessionRepository {
  get(): CustomerSession | null {
    const storage = getStorage()
    if (!storage) return null

    const stored = storage.getItem(SESSION_KEY)
    if (!stored) return null

    try {
      const session: unknown = JSON.parse(stored)
      if (isCustomerSession(session)) return session
      this.clear()
      return null
    } catch {
      this.clear()
      return null
    }
  }

  save(session: CustomerSession): void {
    getStorage()?.setItem(SESSION_KEY, JSON.stringify(session))
  }

  clear(): void {
    getStorage()?.removeItem(SESSION_KEY)
  }
}