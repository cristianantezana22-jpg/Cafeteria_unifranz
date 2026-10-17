import axios, { isAxiosError } from 'axios'
import type { CafeteriaGateway } from '../../application/services/CafeteriaGateway'
import type {
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
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

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
  async login(email: string, password: string): Promise<CashierSession> {
    try {
      const response = await api.post<CashierSession>('/api/auth/login', {
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

  async getMenuProducts(token: string): Promise<MenuProduct[]> {
    try {
      const response = await api.get<MenuProductDto[]>('/api/cajero/menu/products', {
        headers: bearer(token),
      })
      return response.data.map(toMenuProduct)
    } catch (error) {
      throw toReadableError(error, 'No se pudo cargar el menú.')
    }
  }

  async getMenuCategories(token: string): Promise<MenuCategory[]> {
    try {
      const response = await api.get<MenuCategory[]>('/api/cajero/menu/categories', {
        headers: bearer(token),
      })
      return response.data
    } catch (error) {
      throw toReadableError(error, 'No se pudieron cargar las categorías.')
    }
  }

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
