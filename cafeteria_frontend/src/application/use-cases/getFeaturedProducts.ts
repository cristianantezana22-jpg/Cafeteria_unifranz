import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createGetFeaturedProducts(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async () => {
    const session = sessions.get()
    return gateway.getFeaturedProducts(session?.token)
  }
}