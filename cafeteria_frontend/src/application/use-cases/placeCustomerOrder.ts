import type {
  OrderRequestItem,
  PlaceOrderRequest,
} from '../../domain/models'
import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createPlaceCustomerOrder(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (request: PlaceOrderRequest | OrderRequestItem[]) => {
    const session = sessions.get()
    return gateway.placeOrder(session?.token, request)
  }
}
