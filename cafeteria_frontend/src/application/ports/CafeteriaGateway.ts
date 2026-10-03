import type {
  CustomerOrder,
  CustomerSession,
  OrderRequestItem,
  Product,
} from '../../domain/models'

export interface CafeteriaGateway {
  login(email: string, password: string): Promise<CustomerSession>
  getFeaturedProducts(token: string): Promise<Product[]>
  placeOrder(token: string, items: OrderRequestItem[]): Promise<CustomerOrder>
}