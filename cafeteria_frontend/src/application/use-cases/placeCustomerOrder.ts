import type { OrderRequestItem } from '../../domain/models'
import type { CafeteriaGateway } from '../ports/CafeteriaGateway'
import type { SessionRepository } from '../ports/SessionRepository'

export function createPlaceCustomerOrder(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (items: OrderRequestItem[]) => {
    const session = sessions.get()
    if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
    return gateway.placeOrder(session.token, items)
  }
}
