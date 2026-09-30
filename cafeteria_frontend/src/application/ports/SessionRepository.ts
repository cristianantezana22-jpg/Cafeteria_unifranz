import type { CustomerSession } from '../../domain/models'

export interface SessionRepository {
  get(): CustomerSession | null
  save(session: CustomerSession): void
  clear(): void
}