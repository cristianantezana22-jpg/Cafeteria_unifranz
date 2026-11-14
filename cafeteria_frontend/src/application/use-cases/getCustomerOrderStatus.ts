import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createGetCustomerOrderStatus(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (orderId: string) => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.getCustomerOrderStatus(session.token, orderId)
  }
}