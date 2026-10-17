<<<<<<< HEAD
import type { CustomerSession } from '../../domain/models'

export interface SessionRepository {
  get: () => CustomerSession | null
  save: (session: CustomerSession) => void
=======
import type { CashierSession } from '../../domain/models'

export interface SessionRepository {
  get: () => CashierSession | null
  save: (session: CashierSession) => void
>>>>>>> alan
  clear: () => void
}