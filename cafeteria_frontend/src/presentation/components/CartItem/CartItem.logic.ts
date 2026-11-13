import type { Product } from '../../../domain/models'

export type CartItemProps = {
  product: Product
  quantity: number
  onQuantityChange: (productId: string, change: number) => void
  onRemove: (productId: string) => void
}

export function getCartItemDetails(product: Product, quantity: number) {
  const price = Number(product.price)

  return {
    imageUrl: product.imageUrl,
    name: product.name,
    unitPrice: `Bs ${price.toFixed(2)}`,
    subtotal: `Bs ${(price * quantity).toFixed(2)}`,
  }
}
