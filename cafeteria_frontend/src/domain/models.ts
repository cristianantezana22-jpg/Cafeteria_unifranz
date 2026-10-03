export type Customer = {
  id: string
  name: string
  email: string
}

export type CustomerSession = {
  token: string
  customer: Customer
}

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

export type CustomerOrder = {
  id: string
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