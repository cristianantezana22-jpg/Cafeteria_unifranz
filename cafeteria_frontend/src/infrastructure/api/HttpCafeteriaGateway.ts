import axios from 'axios'
import type { CafeteriaGateway } from '../../application/ports/CafeteriaGateway'
import type {
  CustomerOrder,
  CustomerSession,
  OrderRequestItem,
  Product,
} from '../../domain/models'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

export class HttpCafeteriaGateway implements CafeteriaGateway {
  async login(email: string, password: string): Promise<CustomerSession> {
    const response = await api.post<CustomerSession>('/api/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async getFeaturedProducts(token: string): Promise<Product[]> {
    const response = await api.get<Product[]>('/api/products/featured', {
      headers: { Authorization: token },
    })
    return response.data
  }

  async placeOrder(
    token: string,
    items: OrderRequestItem[],
  ): Promise<CustomerOrder> {
    const response = await api.post<CustomerOrder>(
      '/api/orders',
      { items },
      { headers: { Authorization: token } },
    )
    return response.data
  }
}
