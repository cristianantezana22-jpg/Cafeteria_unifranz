import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { CustomerOrder, OrderStatus, Product } from '../../domain/models'
import type { PaymentMethod } from '../../domain/models/Payment'
import { Button } from '../components/Button/Button'
import { CartItem as CartItemRow } from '../components/CartItem/CartItem'
import { CustomerHeader } from '../components/CustomerHeader/CustomerHeader'
import { PaymentModal } from '../components/PaymentModal/PaymentModal'
import { ProductCard } from '../components/ProductCard/ProductCard'
import {
  getCustomerOrderStatus,
  getCurrentSession,
  getFeaturedProducts,
  logoutCustomer,
  placeCustomerOrder,
} from '../../infrastructure/api/cafeteria'
import { STATUS_LABELS, getStatusSteps } from '../components/CashierOrderCard/CashierOrderCard.logic'
import '../components/CashierOrderCard/cashier-order-card.css'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'

type CartItem = {
  product: Product
  quantity: number
}

export function CustomerView() {
  const navigate = useNavigate()
  const [session, setSession] = useState<ReturnType<typeof getCurrentSession>>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [orderConfirmation, setOrderConfirmation] = useState<CustomerOrder | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const today = new Date()
  const todayLabel = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(today).toUpperCase()
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  )
  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

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

  function refreshProducts() {
    getFeaturedProducts()
      .then((fresh) => {
        setProducts(fresh)
        const soldOut = cartItems.filter(
          ({ product }) => fresh.find((p) => p.id === product.id)?.available === false,
        )
        if (soldOut.length > 0) {
          setCartItems((items) =>
            items.filter((i) => !soldOut.some((s) => s.product.id === i.product.id)),
          )
          setCheckoutError(
            `Se agotó: ${soldOut.map((s) => s.product.name).join(', ')}. Lo quitamos de tu carrito.`,
          )
        }
      })
      .catch(() => {})
  }

  function refreshOrderStatus() {
    if (!session || !orderConfirmation) return
    getCustomerOrderStatus(orderConfirmation.id)
      .then((tracking) => setOrderStatus(tracking.status))
      .catch(() => {})
  }

  useEffect(() => {
    if (!session || !orderConfirmation) return
    let active = true
    const refresh = () => {
      getCustomerOrderStatus(orderConfirmation.id)
        .then((tracking) => {
          if (active) setOrderStatus(tracking.status)
        })
        .catch(() => {})
    }
    void refresh()
    const intervalId = window.setInterval(refresh, 5_000)
    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [session, orderConfirmation])

  useRealtimeEvents({
    'products-changed': refreshProducts,
    'orders-changed': refreshOrderStatus,
    reconnected: () => {
      refreshProducts()
      refreshOrderStatus()
    },
  })

  function handleLogout() {
    logoutCustomer()
    void navigate({ to: '/' })
  }

  function handleAddToCart(product: Product) {
    if (!product.available) return
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

  function handleCheckout() {
    if (cartItems.length === 0 || isSubmittingOrder) return

    setCheckoutError('')
    setIsPaymentModalOpen(true)
  }

  async function confirmPayment(method: PaymentMethod) {
    if (cartItems.length === 0 || isSubmittingOrder) return

    setIsSubmittingOrder(true)
    setCheckoutError('')
    try {
      const order = await placeCustomerOrder({
        items: cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
        serviceMode: 'COMER_AQUI',
        paymentMethod: method,
        totalAmount: cartTotal,
      })
      setOrderConfirmation(order)
      setOrderStatus('PENDIENTE')
      setCartItems([])
      setIsPaymentModalOpen(false)
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
        customerName={session?.customer.name ?? 'Cliente'}
        cartItemCount={cartItemCount}
        onLogout={handleLogout}
      />

      <section className="welcome-band">
        <div>
          <p className="eyebrow accent">{todayLabel}</p>
          <h1>Hola, {session?.customer.name.split(' ')[0] ?? 'Cliente'}.</h1>
          <p className="welcome-copy">Tu próximo favorito está más cerca de lo que crees.</p>
          <a className="welcome-explore-button" href="#featured-title">
            Explorar Favoritos <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section id="featured" className="featured-section" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">DE NUESTRA COCINA</p>
            <h2 id="featured-title">Favoritos de la casa<span>.</span></h2>
          </div>
          <span className="product-count">
            {products.length.toString().padStart(2, '0')} PRODUCTOS
          </span>
        </div>

        {isLoading && <p className="status-message">Preparando la vitrina…</p>}
        {hasError && (
          <p className="status-message error-message" role="alert">
            No pudimos cargar el menú. Comprueba que el servidor esté activo.
          </p>
        )}
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

        <div className={`customer-order-layout${orderConfirmation ? ' is-confirmed' : ''}`}>
          {orderConfirmation && (
            <aside className="customer-order-tracking" aria-label="Seguimiento de tu pedido">
              <p className="eyebrow accent">SEGUIMIENTO EN VIVO</p>
              <span className="customer-ticket-label">NÚMERO DE TICKET</span>
              <strong className="customer-ticket-number">
                {orderConfirmation.orderNumber ?? orderConfirmation.id}
              </strong>
              <div className="customer-order-status">
                <span>Estado del pedido</span>
                <strong>{orderStatus ? STATUS_LABELS[orderStatus] : 'Consultando…'}</strong>
              </div>
              {orderStatus && orderStatus !== 'CANCELADO' && (
                <ol className="order-steps">
                  {getStatusSteps(orderStatus).map((step) => (
                    <li
                      key={step.status}
                      className={[
                        'order-steps__item',
                        step.isDone ? 'is-done' : '',
                        step.isCurrent ? 'is-current' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={step.label}
                    >
                      <i />
                      <span className="order-card__ticket-label">{step.label}</span>
                    </li>
                  ))}
                </ol>
              )}
            </aside>
          )}
          <div className="customer-order-content">
            {orderConfirmation && (
              <div className="order-confirmation" role="status">
                <strong>¡Tu pedido fue registrado!</strong>
                <p>
                  Total: Bs {Number(orderConfirmation.total).toFixed(2)}
                  {orderStatus && ` · ${STATUS_LABELS[orderStatus]}`}
                </p>
              </div>
            )}
            {checkoutError && (
              <p className="form-error checkout-error" role="alert">{checkoutError}</p>
            )}
            {cartItems.length === 0 ? (
              !orderConfirmation && (
                <p className="cart-empty">
                  Tu carrito está vacío. Agrega algo rico desde la vitrina.
                </p>
              )
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
          </div>
        </div>
      </section>

      <footer className="customer-footer">
        <span>CAFETERÍA UNIFRANZ</span>
        <span>UN BUEN LUGAR PARA QUEDARSE.</span>
      </footer>
      {isPaymentModalOpen && (
        <PaymentModal
          variant="customer"
          onClose={() => {
            if (!isSubmittingOrder) setIsPaymentModalOpen(false)
          }}
          onConfirm={confirmPayment}
          error={checkoutError}
        />
      )}
    </main>
  )
}