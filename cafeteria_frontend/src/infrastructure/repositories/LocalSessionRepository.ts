import type { SessionRepository } from '../../application/services/SessionRepository'
<<<<<<< HEAD
import type { CustomerSession, UserRole } from '../../domain/models'

const SESSION_KEY = 'cafeteria.customer-session'
const USER_ROLES: UserRole[] = ['CLIENTE', 'CAJERO', 'ADMIN', 'PANTALLA']
=======
import type { CashierSession, UserRole } from '../../domain/models'

const SESSION_KEY = 'cafeteria.cashier-session'
const USER_ROLES: UserRole[] = ['CAJERO']
>>>>>>> alan

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

<<<<<<< HEAD
function isCustomerSession(value: unknown): value is CustomerSession {
  if (!isRecord(value)) return false

  const customer = value.customer
  if (!isRecord(customer)) return false

  return (
    typeof value.token === 'string' &&
    typeof customer.id === 'string' &&
    typeof customer.name === 'string' &&
    typeof customer.email === 'string' &&
=======
function isCashierSession(value: unknown): value is CashierSession {
  if (!isRecord(value)) return false

  const user = value.user
  if (!isRecord(user)) return false

  return (
    typeof value.token === 'string' &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
>>>>>>> alan
    USER_ROLES.some((role) => role === value.role)
  )
}

// En el servidor (SSR) no existe window ni localStorage.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export class LocalSessionRepository implements SessionRepository {
<<<<<<< HEAD
  get(): CustomerSession | null {
=======
  get(): CashierSession | null {
>>>>>>> alan
    const storage = getStorage()
    if (!storage) return null

    const stored = storage.getItem(SESSION_KEY)
    if (!stored) return null

    try {
      const session: unknown = JSON.parse(stored)
<<<<<<< HEAD
      if (isCustomerSession(session)) return session
=======
      if (isCashierSession(session)) return session
>>>>>>> alan
      this.clear()
      return null
    } catch {
      this.clear()
      return null
    }
  }

<<<<<<< HEAD
  save(session: CustomerSession): void {
=======
  save(session: CashierSession): void {
>>>>>>> alan
    getStorage()?.setItem(SESSION_KEY, JSON.stringify(session))
  }

  clear(): void {
    getStorage()?.removeItem(SESSION_KEY)
  }
}