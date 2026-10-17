import type { PaymentMethod } from './Payment'

export type { Category } from './Category'
export type { PaymentMethod } from './Payment'
export type { ServiceMode } from './ServiceMode'

export type Customer = {
  id: string
  name: string
  email: string
}

export type CustomerSession = {
  token: string
  customer: Customer
  role: UserRole
}

export type UserRole = 'CLIENTE' | 'CAJERO' | 'ADMIN' | 'PANTALLA'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  featured: boolean
}

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