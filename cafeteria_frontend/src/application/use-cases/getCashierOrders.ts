import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createGetCashierOrders(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async () => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.getCashierOrders(session.token)
  }
}
