import type { CafeteriaGateway } from '../ports/CafeteriaGateway'
import type { SessionRepository } from '../ports/SessionRepository'

export function createGetFeaturedProducts(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async () => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.getFeaturedProducts(session.token)
  }
}