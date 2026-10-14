import { Button } from '../Button/Button'
import type { ProductCardProps } from './ProductCard.logic'
import { getProductCardDetails } from './ProductCard.logic'
import './product-card.css'

export function ProductCard({
  product,
  index,
  onAddToCart,
}: ProductCardProps) {
  const details = getProductCardDetails(product, index)

  return (
    <article className="product-item">
      <div className="product-image-wrap">
        <img src={details.imageUrl} alt={details.name} loading="lazy" />
        <span className="product-index">{details.indexLabel}</span>
        <span className="product-category">{details.category}</span>
      </div>
      <div className="product-details">
        <div>
          <h3>{details.name}</h3>
          <p>{details.description}</p>
        </div>
        <strong className="product-price">{details.formattedPrice}</strong>
      </div>
      <Button variant="outlined" onClick={() => onAddToCart(product)}>
        Agregar al carrito <span aria-hidden="true">+</span>
      </Button>
    </article>
  )
}
