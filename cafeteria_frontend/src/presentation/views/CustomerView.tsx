import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { CustomerOrder, Product } from '../../domain/models'
import { Button } from '../components/Button/Button'
import { CartItem as CartItemRow } from '../components/CartItem/CartItem'
import { CustomerHeader } from '../components/CustomerHeader/CustomerHeader'
import { ProductCard } from '../components/ProductCard/ProductCard'
import {
  getCurrentSession,
  getFeaturedProducts,
  logoutCustomer,
  placeCustomerOrder,
} from '../../infrastructure/api/cafeteria'

type CartItem = {
  product: Product
  quantity: number
}

export function CustomerView() {
  const navigate = useNavigate()
  const session = getCurrentSession()
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [orderConfirmation, setOrderConfirmation] =
    useState<CustomerOrder | null>(null)
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  )
  const today = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date())

  useEffect(() => {
    let isMounted = true

    getFeaturedProducts()
      .then((featured) => {
        if (isMounted) setProducts(featured)
      })
      .catch(() => {
        if (isMounted) setHasError(true)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  function handleLogout() {
    logoutCustomer()
    void navigate({ to: '/' })
  }

  function handleAddToCart(product: Product) {
    setOrderConfirmation(null)
    setCheckoutError('')
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id)
      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...items, { product, quantity: 1 }]
    })
  }

  function handleQuantityChange(productId: string, change: number) {
    setCartItems((items) =>
      items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    )
  }

  function handleRemoveFromCart(productId: string) {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  async function handleCheckout() {
    if (cartItems.length === 0 || isSubmittingOrder) return

    setIsSubmittingOrder(true)
    setCheckoutError('')
    try {
      const order = await placeCustomerOrder(
        cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      )
      setOrderConfirmation(order)
      setCartItems([])
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? `No pudimos confirmar tu pedido: ${error.message}`
          : 'No pudimos confirmar tu pedido. Inténtalo nuevamente.',
      )
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <main className="customer-page">
      <CustomerHeader
        customerName={session?.customer.name ?? ''}
        cartItemCount={cartItemCount}
        onLogout={handleLogout}
      />

      <section className="welcome-band">
        <div>
          <p className="eyebrow accent">{today.toLocaleUpperCase('es-BO')}</p>
          <h1>Hola, {session?.customer.name.split(' ')[0]}.</h1>
          <p className="welcome-copy">Tu próximo favorito está más cerca de lo que crees.</p>
        </div>
      </section>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">DE NUESTRA COCINA</p>
            <h2 id="featured-title">Favoritos de la casa<span>.</span></h2>
          </div>
          <span className="product-count">{products.length.toString().padStart(2, '0')} PRODUCTOS</span>
        </div>

        {isLoading && <p className="status-message">Preparando la vitrina…</p>}
        {hasError && <p className="status-message error-message" role="alert">No pudimos cargar el menú. Comprueba que el servidor esté activo.</p>}
        {!isLoading && !hasError && products.length === 0 && (
          <p className="status-message">Pronto habrá nuevos favoritos en la vitrina.</p>
        )}

        {!isLoading && !hasError && products.length > 0 && (
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      <section id="cart" className="cart-section" aria-labelledby="cart-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">TU PEDIDO</p>
            <h2 id="cart-title">Carrito<span>.</span></h2>
          </div>
          <span className="product-count">
            {cartItemCount.toString().padStart(2, '0')} PRODUCTOS
          </span>
        </div>

        {orderConfirmation && (
          <p className="order-confirmation" role="status">
            ¡Pedido confirmado! Código: {orderConfirmation.id.slice(0, 8).toUpperCase()}.
            Total: Bs {Number(orderConfirmation.total).toFixed(2)}
          </p>
        )}
        {checkoutError && (
          <p className="form-error checkout-error" role="alert">{checkoutError}</p>
        )}

        {cartItems.length === 0 ? (
          <p className="cart-empty">Tu carrito está vacío. Agrega algo rico desde la vitrina.</p>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map(({ product, quantity }) => (
                <CartItemRow
                  key={product.id}
                  product={product}
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveFromCart}
                />
              ))}
            </div>
            <div className="cart-checkout">
              <div className="cart-total">
                <span>Total del pedido</span>
                <strong>Bs {cartTotal.toFixed(2)}</strong>
              </div>
              <Button
                variant="checkout"
                onClick={() => void handleCheckout()}
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? 'Confirmando…' : 'Confirmar pedido'}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </>
        )}
      </section>

      <footer className="customer-footer"><span>CAFETERÍA UNIFRANZ</span><span>UN BUEN LUGAR PARA QUEDARSE.</span></footer>
    </main>
  )
}