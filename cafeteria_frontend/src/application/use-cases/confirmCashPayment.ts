import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createConfirmCashPayment(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (orderId: number) => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.confirmCashPayment(session.token, orderId)
  }
}
