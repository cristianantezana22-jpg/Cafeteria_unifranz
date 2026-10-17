import type { CashierSession } from '../../domain/models'

export interface SessionRepository {
  get: () => CashierSession | null
  save: (session: CashierSession) => void
  clear: () => void
}