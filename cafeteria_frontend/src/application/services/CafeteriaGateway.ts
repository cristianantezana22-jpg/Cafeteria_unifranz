import type {
  CustomerOrder,
  CustomerSession,
  Category,
  OrderRequestItem,
  PlaceOrderRequest,
  Product,
} from '../../domain/models'

export interface CafeteriaGateway {
  login: (email: string, password: string) => Promise<CustomerSession>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<CustomerSession>
  getProducts: (token?: string) => Promise<Product[]>
  getCategories: (token?: string) => Promise<Category[]>
  getFeaturedProducts: (token: string) => Promise<Product[]>
  placeOrder: (
    token: string,
    request: PlaceOrderRequest | OrderRequestItem[],
  ) => Promise<CustomerOrder>
}