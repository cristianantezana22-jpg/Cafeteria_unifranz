import { useEffect, useState } from 'react'
import type { Category } from '../../domain/models/Category'
import type { CustomerOrder, Product } from '../../domain/models'
import type { PaymentMethod } from '../../domain/models/Payment'
import type { ServiceMode } from '../../domain/models/ServiceMode'
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter'
import { PaymentModal } from '../components/PaymentModal/PaymentModal'
import { Screensaver } from '../components/Screensaver/Screensaver'
import { ServiceModeModal } from '../components/ServiceModeModal/ServiceModeModal'
import { TicketConfirmationModal } from '../components/TicketConfirmationModal/TicketConfirmationModal'
import { useIdleTimeout } from '../hooks/useIdleTimeout'
import {
  getCurrentSession,
  getCategories,
  getProducts,
  placeCustomerOrder,
} from '../../infrastructure/api/cafeteria'
import './screens-view.css'

type KioskCartItem = {
  product: Product
  quantity: number
}

type TicketState = {
  order: CustomerOrder
  serviceMode: ServiceMode
  paymentMethod: PaymentMethod
}

function formatPrice(price: number) {
  return `Bs ${Number(price).toFixed(2)}`
}

export function ScreensView() {
  const session = getCurrentSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cartItems, setCartItems] = useState<KioskCartItem[]>([])
  const [started, setStarted] = useState(false)
  const [serviceMode, setServiceMode] = useState<ServiceMode | null>(null)
  const [isServiceModeModalOpen, setIsServiceModeModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [ticket, setTicket] = useState<TicketState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [catalogError, setCatalogError] = useState('')

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  )
  const filterCategories: Category[] = [
    { id: 'all', nombre: 'Todos' },
    ...categories,
  ]
  const selectedCategory = categories.find(
    (category) => category.id === activeCategory,
  )
  const visibleProducts =
    activeCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory?.nombre)

  function resetKiosk() {
    setTicket(null)
    setStarted(false)
    setServiceMode(null)
    setIsServiceModeModalOpen(false)
    setIsPaymentModalOpen(false)
    setCartItems([])
    setActiveCategory('all')
    setCheckoutError('')
  }

  useIdleTimeout(resetKiosk, 30_000, started && ticket === null)

  useEffect(() => {
    if (!ticket) return

    const timeoutId = setTimeout(resetKiosk, 5_000)
    return () => clearTimeout(timeoutId)
  }, [ticket])

  useEffect(() => {
    let isMounted = true

    Promise.all([getProducts(), getCategories()])
      .then(([loadedProducts, loadedCategories]) => {
        if (!isMounted) return
        setProducts(loadedProducts)
        setCategories(loadedCategories)
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setCatalogError(
            error instanceof Error
              ? `No hay productos disponibles en el menú actual. ${error.message}`
              : 'No hay productos disponibles en el menú actual.',
          )
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  function addToCart(product: Product) {
    setCheckoutError('')
    setCartItems((items) => {
      const currentItem = items.find((item) => item.product.id === product.id)
      if (currentItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...items, { product, quantity: 1 }]
    })
  }

  function changeQuantity(productId: string, delta: number) {
    setCartItems((items) =>
      items.flatMap((item) => {
        if (item.product.id !== productId) return [item]
        const quantity = item.quantity + delta
        return quantity > 0 ? [{ ...item, quantity }] : []
      }),
    )
  }

  function removeFromCart(productId: string) {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  async function confirmPayment(method: PaymentMethod) {
    if (cartItems.length === 0 || isSubmittingOrder) return
    if (!serviceMode) {
      setCheckoutError('Elige si tu pedido es para comer aquí o para llevar.')
      return
    }

    setIsSubmittingOrder(true)
    setCheckoutError('')
    try {
      const order = await placeCustomerOrder({
        items: cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
        serviceMode: serviceMode === 'DINE_IN' ? 'COMER_AQUI' : 'LLEVAR',
        paymentMethod: method,
        totalAmount: cartTotal,
      })
      setTicket({
        order,
        serviceMode,
        paymentMethod: method,
      })
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
    <>
      {!started && (
        <Screensaver
          onStart={() => {
            setCheckoutError('')
            setStarted(true)
            setIsServiceModeModalOpen(true)
          }}
        />
      )}
      {started && <main className="kiosk-screen">
      <aside className="kiosk-order-panel" aria-label="Tu pedido">
        <div className="kiosk-order-top">
          <div className="kiosk-brand" aria-label="Cafetería Unifranz">
            <span className="kiosk-brand-mark" aria-hidden="true">C</span>
            <span><strong>CAFETERÍA</strong><small>UNIFRANZ</small></span>
          </div>
          <div className="kiosk-service-badge">
            <span aria-hidden="true">
              {serviceMode === 'DINE_IN' ? (
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
              )}
            </span>
            <span>{serviceMode === 'DINE_IN' ? 'Comer aquí' : 'Para llevar'}</span>
          </div>
          <div className="kiosk-order-heading">
            <div>
              <p className="kiosk-overline">TU SELECCIÓN</p>
              <h1>Tu pedido</h1>
            </div>
            <span className="kiosk-item-count">{itemCount}</span>
          </div>
        </div>

        <div className="kiosk-cart-list" aria-live="polite">
          {cartItems.length === 0 ? (
            <div className="kiosk-empty-cart">
              <span aria-hidden="true">＋</span>
              <strong>Aún no agregaste productos</strong>
              <p>Explora el menú y toca “Agregar” para comenzar.</p>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <article className="kiosk-cart-item" key={product.id}>
                <div className="kiosk-cart-item-info">
                  <strong>{product.name}</strong>
                  <span>{formatPrice(Number(product.price))} c/u</span>
                  <div className="kiosk-quantity-control" aria-label={`Cantidad de ${product.name}`}>
                    <button
                      type="button"
                      onClick={() => changeQuantity(product.id, -1)}
                      aria-label={`Quitar una unidad de ${product.name}`}
                    >−</button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(product.id, 1)}
                      aria-label={`Agregar una unidad de ${product.name}`}
                    >+</button>
                  </div>
                </div>
                <div className="kiosk-cart-item-end">
                  <strong>{formatPrice(Number(product.price) * quantity)}</strong>
                  <button
                    className="kiosk-remove-item"
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Eliminar ${product.name}`}
                  >Eliminar</button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="kiosk-order-footer">
          <div className="kiosk-total-row">
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <button
            className="kiosk-pay-button"
            type="button"
            onClick={() => {
              setCheckoutError('')
              setIsPaymentModalOpen(true)
            }}
            disabled={cartItems.length === 0 || isSubmittingOrder}
          >
            PAGAR AHORA <span aria-hidden="true">→</span>
          </button>
          <p className="kiosk-footer-note">Pago seguro · Hecho con cariño</p>
        </div>
      </aside>

      <section className="kiosk-menu-panel" aria-labelledby="kiosk-menu-title">
        <header className="kiosk-menu-header">
          <div>
            <p className="kiosk-overline">
              BIENVENIDO
              {session?.customer.name
                ? `, ${session.customer.name.split(' ')[0].toLocaleUpperCase('es-BO')}`
                : ''}
            </p>
            <h2 id="kiosk-menu-title">¿Qué se te antoja?</h2>
            <p>Elige algo rico para disfrutar hoy.</p>
          </div>
          <span className="kiosk-menu-header-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" focusable="false">
              <path d="M7 12h16v7a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7v-7Z" />
              <path d="M23 14h2a4 4 0 0 1 0 8h-3M10 5c0 2 2 2 2 4m5-4c0 2 2 2 2 4" />
              <path d="M5 29h22" />
            </svg>
          </span>
        </header>

        <div className="kiosk-menu-scroll">
          <CategoryFilter
            categories={filterCategories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {isLoading ? (
            <p className="kiosk-menu-status" role="status">Cargando…</p>
          ) : catalogError ? (
            <p className="kiosk-menu-status" role="alert">{catalogError}</p>
          ) : visibleProducts.length === 0 ? (
            <p className="kiosk-menu-status" role="status">
              No hay productos disponibles en el menú actual.
            </p>
          ) : (
            <div className="kiosk-product-grid">
              {visibleProducts.map((product) => (
                <article className="kiosk-product-card" key={product.id}>
                  <div className="kiosk-product-image">
                    <img
                      src={product.imageUrl}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.visibility = 'hidden'
                      }}
                    />
                    <span className="kiosk-product-category">{product.category}</span>
                  </div>
                  <div className="kiosk-product-info">
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                    </div>
                    <div className="kiosk-product-action">
                      <strong>{formatPrice(Number(product.price))}</strong>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        aria-label={`Agregar ${product.name} al pedido`}
                      >
                        Agregar <span aria-hidden="true">+</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      </main>}
      {started && isPaymentModalOpen && (
        <PaymentModal
          onClose={() => {
            if (!isSubmittingOrder) setIsPaymentModalOpen(false)
          }}
          onConfirm={confirmPayment}
          error={checkoutError}
        />
      )}

      {started && ticket && (
        <TicketConfirmationModal
          orderNumber={ticket.order.orderNumber ?? ticket.order.id}
          items={ticket.order.items}
          total={Number(ticket.order.total)}
          serviceMode={ticket.serviceMode}
          paymentMethod={ticket.paymentMethod}
          onDone={resetKiosk}
        />
      )}
      {isServiceModeModalOpen && (
        <ServiceModeModal
          onSelect={(mode) => {
            setServiceMode(mode)
            setIsServiceModeModalOpen(false)
          }}
          onCancel={() => {
            setIsServiceModeModalOpen(false)
            setStarted(false)
          }}
        />
      )}
    </>
  )
}
