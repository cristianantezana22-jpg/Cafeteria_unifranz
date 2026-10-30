import axios, { isAxiosError } from 'axios'
import type { CafeteriaGateway } from '../../application/services/CafeteriaGateway'
import type {
  CashierOrder,
  CashierProfile,
  Category,
  CustomerOrder,
  CustomerSession,
  MenuCategory,
  MenuProduct,
  MenuProductRequest,
  OrderStatus,
  OrderRequestItem,
  PlaceOrderRequest,
  Product,
  UserRole,
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
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      })
      return mapSession(response.data)
    } catch (error) {
      throw toReadableError(
        error,
        'No pudimos validar tus datos. Revisa el correo y la contraseña.',
      )
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<CustomerSession> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', {
        nombreCompleto: name,
        email,
        password,
      })
      return mapSession(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo crear la cuenta. Inténtalo de nuevo.')
    } // <- Llave de cierre del catch añadida
  }   // <- Llave de cierre del método register añadida

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

  async getCashierOrders(token: string): Promise<CashierOrder[]> {
    try {
      const response = await api.get<CashierOrderResponse[]>(
        '/api/cajero/pedidos',
        { headers: bearer(token) },
      )
      return response.data.map(mapCashierOrder)
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar los pedidos de caja.')
    }
  }

  async getCashierProfile(token: string): Promise<CashierProfile> {
    try {
      const response = await api.get<CashierProfileResponse>(
        '/api/cajero/perfil',
        { headers: bearer(token) },
      )
      return {
        block: response.data.bloque,
        canManageLunch: response.data.gestionaAlmuerzos,
      }
    } catch (error) {
      throw toReadableError(error, 'No se pudo cargar el perfil de caja.')
    }
  }

  async updateOrderStatus(
    token: string,
    orderId: number,
    status: OrderStatus,
  ): Promise<CashierOrder> {
    try {
      const response = await api.patch<CashierOrderResponse>(
        `/api/cajero/pedidos/${orderId}/estado`,
        { estado: status },
        { headers: bearer(token) },
      )
      return mapCashierOrder(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo actualizar el estado del pedido.')
    }
  }

  async getMenuProducts(token: string): Promise<MenuProduct[]> {
    try {
      const response = await api.get<MenuProductResponse[]>(
        '/api/cajero/menu/products',
        { headers: bearer(token) },
      )
      return response.data.map(mapMenuProduct)
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar los productos del menú.')
    }
  }

  async getMenuCategories(token: string): Promise<MenuCategory[]> {
    try {
      const response = await api.get<MenuCategoryResponse[]>(
        '/api/cajero/menu/categories',
        { headers: bearer(token) },
      )
      return response.data.map((category) => ({
        id: category.id,
        name: category.name,
      }))
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar las categorías del menú.')
    }
  }

  async createMenuProduct(
    token: string,
    request: MenuProductRequest,
  ): Promise<MenuProduct> {
    try {
      const response = await api.post<MenuProductResponse>(
        '/api/cajero/menu/products',
        toMenuProductRequest(request),
        { headers: bearer(token) },
      )
      return mapMenuProduct(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo crear el producto.')
    }
  }

  async updateMenuProduct(
    token: string,
    productId: string,
    request: MenuProductRequest,
  ): Promise<MenuProduct> {
    try {
      const response = await api.put<MenuProductResponse>(
        `/api/cajero/menu/products/${productId}`,
        toMenuProductRequest(request),
        { headers: bearer(token) },
      )
      return mapMenuProduct(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo actualizar el producto.')
    }
  }

  async deleteMenuProduct(token: string, productId: string): Promise<void> {
    try {
      await api.delete(`/api/cajero/menu/products/${productId}`, {
        headers: bearer(token),
      })
    } catch (error) {
      throw toReadableError(error, 'No se pudo eliminar el producto.')
    }
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

type AuthResponse = {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
  role: UserRole
}

type CashierProfileResponse = {
  bloque: CashierProfile['block']
  gestionaAlmuerzos: boolean
}

type CashierOrderResponse = {
  id: number
  ticket: string
  estado: OrderStatus
  origen: string
  cliente: string
  metodoPago: string | null
  estadoPago: string | null
  total: number
  creadoEn: string
  almuerzo: boolean
  editable: boolean
  siguienteEstado: OrderStatus | null
  cancelable: boolean
  items: {
    nombre: string
    cantidad: number
    subtotal: number
  }[]
}

type MenuCategoryResponse = {
  id: number
  name: string
}

type MenuProductResponse = {
  id: number
  name: string
  description: string
  price: number
  category: string
  categoryId: number
  imageUrl: string
  featured: boolean
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

function mapSession(response: AuthResponse): CustomerSession {
  return {
    token: response.token,
    customer: response.user,
    role: response.role,
  }
}

function mapCashierOrder(order: CashierOrderResponse): CashierOrder {
  return {
    id: order.id,
    ticket: order.ticket,
    status: order.estado,
    origin: order.origen,
    customerName: order.cliente,
    paymentMethod: order.metodoPago,
    paymentStatus: order.estadoPago,
    total: Number(order.total),
    createdAt: order.creadoEn,
    isLunch: order.almuerzo,
    isEditable: order.editable,
    nextStatus: order.siguienteEstado,
    isCancellable: order.cancelable,
    items: order.items.map((item) => ({
      name: item.nombre,
      quantity: item.cantidad,
      subtotal: Number(item.subtotal),
    })),
  }
}

function mapMenuProduct(product: MenuProductResponse): MenuProduct {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    category: product.category,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl,
    featured: product.featured,
  }
}

function toMenuProductRequest(request: MenuProductRequest) {
  return {
    name: request.name,
    categoryId: request.categoryId,
    price: request.price,
    featured: request.featured,
  }
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
