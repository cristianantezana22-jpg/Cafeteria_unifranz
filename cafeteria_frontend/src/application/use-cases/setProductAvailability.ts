import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createSetProductAvailability(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (productId: string, available: boolean) => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.setProductAvailability(session.token, productId, available)
  }
}