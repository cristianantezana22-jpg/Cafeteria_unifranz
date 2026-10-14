import type { Product } from '../../../domain/models'

export type ProductCardProps = {
  product: Product
  index: number
  onAddToCart: (product: Product) => void
}

export function getProductCardDetails(product: Product, index: number) {
  return {
    imageUrl: product.imageUrl,
    name: product.name,
    indexLabel: `0${index + 1}`,
    category: product.category,
    description: product.description,
    formattedPrice: `Bs ${Number(product.price).toFixed(2)}`,
  }
}
