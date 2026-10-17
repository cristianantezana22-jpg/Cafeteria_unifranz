import axios, { isAxiosError } from 'axios'
import type { CafeteriaGateway } from '../../application/services/CafeteriaGateway'
import type {
  Category,
  CustomerOrder,
  CustomerSession,
  OrderRequestItem,
  PlaceOrderRequest,
  Product,
} from '../../domain/models'
import { LocalSessionRepository } from '../repositories/LocalSessionRepository'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '')
const PRODUCTS_ENDPOINT = '/api/products'
const CATEGORIES_ENDPOINT = '/api/categories'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

const sessions = new LocalSessionRepository()

api.interceptors.request.use((config) => {
  const token = sessions.get()?.token
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

export class HttpApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'HttpApiError'
  }
}

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// Convierte los errores de axios en mensajes legibles para la UI.
function toReadableError(error: unknown, fallback: string): Error {
  if (isAxiosError<{ detail?: string; message?: string }>(error)) {
    if (!error.response) {
      return new HttpApiError(
        'No se pudo conectar con el servidor. Verifica que el backend esté activo.',
      )
    }
    return new HttpApiError(
      error.response.data?.message ?? error.response.data?.detail ?? fallback,
      error.response.status,
    )
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

  async getProducts(token?: string): Promise<Product[]> {
    try {
      const response = await api.get<ProductResponse[]>(
        PRODUCTS_ENDPOINT,
        token ? { headers: bearer(token) } : undefined,
      )
      return response.data.map(mapProduct)
    } catch (error) {
      throw toReadableError(error, 'No se pudo cargar el menú.')
    }
  }

  async getCategories(token?: string): Promise<Category[]> {
    try {
      const response = await api.get<CategoryResponse[]>(
        CATEGORIES_ENDPOINT,
        token ? { headers: bearer(token) } : undefined,
      )
      return response.data.map((category) => ({
        id: String(category.id),
        nombre: category.name,
      }))
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar las categorías.')
    }
  }

  async getFeaturedProducts(token: string): Promise<Product[]> {
    return this.getProducts(token)
  }

  async placeOrder(
    token: string,
    request: PlaceOrderRequest | OrderRequestItem[],
  ): Promise<CustomerOrder> {
    try {
      const body: PlaceOrderRequest = Array.isArray(request)
        ? {
            items: request,
            serviceMode: 'COMER_AQUI',
            paymentMethod: 'EFECTIVO',
            totalAmount: 0,
          }
        : request
      const response = await api.post<OrderResponse>(
        '/api/orders',
        body,
        { headers: bearer(token) },
      )
      return mapOrder(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo registrar el pedido.')
    }
  }
}

type CategoryResponse = {
  id: number
  name: string
}

type ProductResponse = {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  category: CategoryResponse
}

type OrderResponse = {
  id: number
  orderNumber: string
  customerId: number | null
  items: {
    productId: number
    name: string
    unitPrice: number
    quantity: number
    subtotal: number
  }[]
  totalAmount: number
  createdAt: string
}

function mapProduct(product: ProductResponse): Product {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    category: product.category.name,
    imageUrl: product.imageUrl,
    featured: true,
  }
}

function mapOrder(order: OrderResponse): CustomerOrder {
  return {
    id: String(order.id),
    orderNumber: order.orderNumber,
    customerId: order.customerId === null ? '' : String(order.customerId),
    items: order.items.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
    total: Number(order.totalAmount),
    createdAt: order.createdAt,
  }
}
