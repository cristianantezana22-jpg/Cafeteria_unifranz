import type { SessionRepository } from '../../application/ports/SessionRepository'
import type { CustomerSession } from '../../domain/models'

const SESSION_KEY = 'cafeteria.customer-session'

export class LocalSessionRepository implements SessionRepository {
  get(): CustomerSession | null {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored) as CustomerSession
    } catch {
      this.clear()
      return null
    }
  }

  save(session: CustomerSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY)
  }
}