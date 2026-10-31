import { Button } from '../Button/Button'
import { SoldOutBadge } from '../SoldOutBadge/SoldOutBadge'
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
    <article className={`product-item${product.available ? '' : ' is-soldout'}`}>
      <div className="product-image-wrap">
        <img src={details.imageUrl} alt={details.name} loading="lazy" />
        {!product.available && <SoldOutBadge />}
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
      <Button
        disabled={!product.available}
        onClick={() => product.available && onAddToCart(product)}
        variant="outlined"
      >
        {product.available ? (
          <>
            Agregar al carrito <span aria-hidden="true">+</span>
          </>
        ) : (
          'Producto agotado'
        )}
      </Button>
    </article>
  )
}