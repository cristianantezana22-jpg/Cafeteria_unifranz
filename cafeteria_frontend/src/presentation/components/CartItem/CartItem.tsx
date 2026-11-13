import './cart-item.css'
import type { CartItemProps } from './CartItem.logic'
import { getCartItemDetails } from './CartItem.logic'

export function CartItem({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const details = getCartItemDetails(product, quantity)

  return (
    <article className="cart-item">
      <img src={details.imageUrl} alt="" />
      <div className="cart-item-info">
        <h3>{details.name}</h3>
        <span>{details.unitPrice} c/u</span>
      </div>
      <div className="cart-quantity" aria-label={`Cantidad de ${details.name}`}>
        <button
          type="button"
          onClick={() => onQuantityChange(product.id, -1)}
          aria-label={`Quitar una unidad de ${details.name}`}
        >
          −
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          onClick={() => onQuantityChange(product.id, 1)}
          aria-label={`Agregar una unidad de ${details.name}`}
        >
          +
        </button>
      </div>
      <strong className="cart-subtotal">
        {details.subtotal}
      </strong>
      <button
        className="remove-cart-item"
        type="button"
        onClick={() => onRemove(product.id)}
        aria-label={`Eliminar ${details.name} del carrito`}
      >
        Quitar
      </button>
    </article>
  )
}
