export type CashierUser = {
  id: string
  name: string
  email: string
}

export type CashierSession = {
  token: string
  user: CashierUser
  role: UserRole
}

export type UserRole = 'CAJERO'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  featured: boolean
}

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
