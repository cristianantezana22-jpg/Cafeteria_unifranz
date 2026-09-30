import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Product } from '../domain/models'
import brandLogo from '../assets/pink-paper-logo.svg'
import {
  getCurrentSession,
  getFeaturedProducts,
  logoutCustomer,
} from '../infrastructure/cafeteria'

export const Route = createFileRoute('/cliente')({
  beforeLoad: () => {
    if (!getCurrentSession()) throw redirect({ to: '/' })
  },
  component: CustomerHome,
})

function CustomerHome() {
  const navigate = useNavigate()
  const session = getCurrentSession()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
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

  return (
    <main className="customer-page">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
        </div>
        <div className="topbar-right">
          <span className="location-label"><i /> LA PAZ, BOLIVIA</span>
          <span className="topbar-divider" />
          <span className="customer-name">{session?.customer.name}</span>
          <button className="logout-button" onClick={handleLogout}>Salir</button>
        </div>
      </header>

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
              <article className="product-item" key={product.id}>
                <div className="product-image-wrap">
                  <img src={product.imageUrl} alt={product.name} loading="lazy" />
                  <span className="product-index">0{index + 1}</span>
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-details">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  <strong className="product-price">Bs {Number(product.price).toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="customer-footer"><span>CAFETERÍA UNIFRANZ</span><span>UN BUEN LUGAR PARA QUEDARSE.</span></footer>
    </main>
  )
}