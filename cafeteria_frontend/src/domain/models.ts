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