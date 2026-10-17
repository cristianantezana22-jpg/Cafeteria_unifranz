<<<<<<< HEAD
import type { PaymentMethod } from './Payment'

export type { Category } from './Category'
export type { PaymentMethod } from './Payment'
export type { ServiceMode } from './ServiceMode'

export type Customer = {
=======
export type CashierUser = {
>>>>>>> alan
  id: string
  name: string
  email: string
}

<<<<<<< HEAD
export type CustomerSession = {
  token: string
  customer: Customer
  role: UserRole
}

export type UserRole = 'CLIENTE' | 'CAJERO' | 'ADMIN' | 'PANTALLA'
=======
export type CashierSession = {
  token: string
  user: CashierUser
  role: UserRole
}

export type UserRole = 'CAJERO'
>>>>>>> alan

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  featured: boolean
}

<<<<<<< HEAD
export type OrderRequestItem = {
  productId: string
  quantity: number
}

export type PlaceOrderRequest = {
  items: OrderRequestItem[]
  serviceMode: 'COMER_AQUI' | 'LLEVAR'
  paymentMethod: PaymentMethod
  totalAmount: number
}

export type CustomerOrder = {
  id: string
  orderNumber?: string
  customerId: string
  items: {
    productId: string
    name: string
    unitPrice: number
    quantity: number
    subtotal: number
  }[]
  total: number
  createdAt: string
}
=======
export type MenuCategory = {
  id: number
  name: string
}

export type MenuProduct = Product & {
  categoryId: number
}

export type MenuProductRequest = {
  name: string
  categoryId: number
  price: number
  featured: boolean
}

export type OrderStatus =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO'

export type CashierBlock = 'Bloque A' | 'Bloque B'

export type CashierProfile = {
  block: CashierBlock
  canManageLunch: boolean
}

export type CashierOrderItem = {
  name: string
  quantity: number
  subtotal: number
}

export type CashierOrder = {
  id: number
  ticket: string
  status: OrderStatus
  origin: string
  customerName: string
  paymentMethod: string | null
  paymentStatus: string | null
  total: number
  createdAt: string
  isLunch: boolean
  isEditable: boolean
  nextStatus: OrderStatus | null
  isCancellable: boolean
  items: CashierOrderItem[]
}
>>>>>>> alan
