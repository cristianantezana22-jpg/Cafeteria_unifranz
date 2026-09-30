import type { CustomerSession, Product } from '../../domain/models'

export interface CafeteriaGateway {
  login(email: string, password: string): Promise<CustomerSession>
  getFeaturedProducts(token: string): Promise<Product[]>
}