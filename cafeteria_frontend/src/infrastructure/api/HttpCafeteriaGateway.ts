import axios, { isAxiosError } from 'axios'
import type { CafeteriaGateway } from '../../application/services/CafeteriaGateway'
import type {
  CustomerOrder,
  CustomerSession,
  OrderRequestItem,
  Product,
} from '../../domain/models'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// Convierte los errores de axios en mensajes legibles para la UI.
function toReadableError(error: unknown, fallback: string): Error {
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return new Error(
        'No se pudo conectar con el servidor. Verifica que el backend esté activo.',
      )
    }
    return new Error(error.response.data?.message ?? fallback)
  }
  return new Error(fallback)
}

export class HttpCafeteriaGateway implements CafeteriaGateway {
  async login(email: string, password: string): Promise<CustomerSession> {
    try {
      const response = await api.post<CustomerSession>('/api/auth/login', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      throw toReadableError(
        error,
        'No pudimos validar tus datos. Revisa el correo y la contraseña.',
      )
    }
  }

  async getFeaturedProducts(token: string): Promise<Product[]> {
    const response = await api.get<Product[]>('/api/products/featured', {
      headers: bearer(token),
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
      { headers: bearer(token) },
    )
    return response.data
  }
}
