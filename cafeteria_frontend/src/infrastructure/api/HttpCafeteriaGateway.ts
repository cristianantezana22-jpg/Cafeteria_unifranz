import axios, { isAxiosError } from 'axios'
import type { CafeteriaGateway } from '../../application/services/CafeteriaGateway'
import type {
<<<<<<< HEAD
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
=======
  CashierBlock,
  CashierOrder,
  CashierProfile,
  CashierSession,
  MenuCategory,
  MenuProduct,
  MenuProductRequest,
  OrderStatus,
} from '../../domain/models'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
>>>>>>> alan
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

<<<<<<< HEAD
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

=======
type CashierProfileDto = {
  bloque: CashierBlock
  gestionaAlmuerzos: boolean
}

type CashierOrderDto = {
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
  items: { nombre: string; cantidad: number; subtotal: number }[]
}

type MenuProductDto = {
  id: number
  name: string
  description: string
  price: number
  category: string
  categoryId: number
  imageUrl: string
  featured: boolean
}

function toCashierOrder(dto: CashierOrderDto): CashierOrder {
  return {
    id: dto.id,
    ticket: dto.ticket,
    status: dto.estado,
    origin: dto.origen,
    customerName: dto.cliente,
    paymentMethod: dto.metodoPago,
    paymentStatus: dto.estadoPago,
    total: Number(dto.total),
    createdAt: dto.creadoEn,
    isLunch: dto.almuerzo,
    isEditable: dto.editable,
    nextStatus: dto.siguienteEstado,
    isCancellable: dto.cancelable,
    items: dto.items.map((item) => ({
      name: item.nombre,
      quantity: item.cantidad,
      subtotal: Number(item.subtotal),
    })),
  }
}

function toMenuProduct(dto: MenuProductDto): MenuProduct {
  return { ...dto, id: String(dto.id), price: Number(dto.price) }
}

>>>>>>> alan
function bearer(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// Convierte los errores de axios en mensajes legibles para la UI.
function toReadableError(error: unknown, fallback: string): Error {
<<<<<<< HEAD
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
=======
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return new Error(
        'No se pudo conectar con el servidor. Verifica que el backend esté activo.',
      )
    }
    return new Error(error.response.data?.message ?? fallback)
>>>>>>> alan
  }
  return new Error(fallback)
}

export class HttpCafeteriaGateway implements CafeteriaGateway {
<<<<<<< HEAD
  async login(email: string, password: string): Promise<CustomerSession> {
    try {
      const response = await api.post<CustomerSession>('/api/auth/login', {
=======
  async login(email: string, password: string): Promise<CashierSession> {
    try {
      const response = await api.post<CashierSession>('/api/auth/login', {
>>>>>>> alan
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

<<<<<<< HEAD
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<CustomerSession> {
    try {
      const response = await api.post<CustomerSession>('/api/auth/register', {
        nombreCompleto: name,
        email,
        password,
      })
      return response.data
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
=======
  async getMenuProducts(token: string): Promise<MenuProduct[]> {
    try {
      const response = await api.get<MenuProductDto[]>('/api/cajero/menu/products', {
        headers: bearer(token),
      })
      return response.data.map(toMenuProduct)
>>>>>>> alan
    } catch (error) {
      throw toReadableError(error, 'No se pudo cargar el menú.')
    }
  }

<<<<<<< HEAD
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
=======
  async getMenuCategories(token: string): Promise<MenuCategory[]> {
    try {
      const response = await api.get<MenuCategory[]>('/api/cajero/menu/categories', {
        headers: bearer(token),
      })
      return response.data
>>>>>>> alan
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar las categorías.')
    }
  }

<<<<<<< HEAD
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
=======
  async createMenuProduct(
    token: string,
    product: MenuProductRequest,
  ): Promise<MenuProduct> {
    try {
      const response = await api.post<MenuProductDto>(
        '/api/cajero/menu/products',
        product,
        { headers: bearer(token) },
      )
      return toMenuProduct(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo agregar el producto.')
    }
  }

  async updateMenuProduct(
    token: string,
    productId: string,
    product: MenuProductRequest,
  ): Promise<MenuProduct> {
    try {
      const response = await api.put<MenuProductDto>(
        `/api/cajero/menu/products/${productId}`,
        product,
        { headers: bearer(token) },
      )
      return toMenuProduct(response.data)
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

  async getCashierProfile(token: string): Promise<CashierProfile> {
    try {
      const response = await api.get<CashierProfileDto>('/api/cajero/perfil', {
        headers: bearer(token),
      })
      return {
        block: response.data.bloque,
        canManageLunch: response.data.gestionaAlmuerzos,
      }
    } catch (error) {
      throw toReadableError(error, 'No se pudo cargar el perfil de caja.')
    }
  }

  async getCashierOrders(token: string): Promise<CashierOrder[]> {
    try {
      const response = await api.get<CashierOrderDto[]>('/api/cajero/pedidos', {
        headers: bearer(token),
      })
      return response.data.map(toCashierOrder)
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar los pedidos.')
    }
  }

  async updateOrderStatus(
    token: string,
    orderId: number,
    status: OrderStatus,
  ): Promise<CashierOrder> {
    try {
      const response = await api.patch<CashierOrderDto>(
        `/api/cajero/pedidos/${orderId}/estado`,
        { estado: status },
        { headers: bearer(token) },
      )
      return toCashierOrder(response.data)
    } catch (error) {
      throw toReadableError(error, 'No se pudo actualizar el pedido.')
    }
  }

}
>>>>>>> alan
