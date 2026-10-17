import type { OrderStatus } from '../../domain/models'
import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createUpdateCashierOrderStatus(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (orderId: number, status: OrderStatus) => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.updateOrderStatus(session.token, orderId, status)
  }
}
