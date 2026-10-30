import { useState } from 'react'
import { Button } from '../Button/Button'
import { CashierOrderCard } from '../CashierOrderCard/CashierOrderCard'
import { Icon } from '../Icon/Icon'
import { FILTERS, useCashierBoard } from './CashierBoard.logic'
import { CashierMenuView } from '../../views/CashierMenuView'
import './cashier-board.css'

export function CashierBoard() {
  const [activeSection, setActiveSection] = useState<'orders' | 'menu'>('orders')
  const {
    userName,
    profile,
    filter,
    setFilter,
    counts,
    visibleOrders,
    isLoading,
    updatingId,
    error,
    handleAdvance,
    handleCancel,
    handleLogout,
    refresh,
  } = useCashierBoard()

  if (activeSection === 'menu') {
    return (
      <CashierMenuView
        onBackToOrders={() => setActiveSection('orders')}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <main className="cashier-page">
      <section className="welcome-band">
        <div>
          <p className="eyebrow accent">
            CAJA{profile ? ` · ${profile.block.toLocaleUpperCase('es-BO')}` : ''}
          </p>
          <h1>Panel de cajero</h1>
          <p className="welcome-copy">
            Sesión iniciada como {userName}.
            {profile && !profile.canManageLunch && ' Los almuerzos se gestionan desde el Bloque A.'}
          </p>
        </div>
        <div className="cashier-header-actions">
          <button
            className="cashier-menu-link"
            onClick={() => setActiveSection('menu')}
            type="button"
          >
            Gestionar menú
          </button>
          <div className="cashier-logout">
            <Button variant="outlined" onClick={handleLogout}>
              Cerrar sesión
              <span aria-hidden="true">↗</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="cashier-section" aria-labelledby="orders-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">SEGUIMIENTO</p>
            <h2 id="orders-title">
              Pedidos<span>.</span>
            </h2>
          </div>
          <button className="cashier-refresh" type="button" onClick={refresh}>
            <Icon name="refresh" size={15} /> Actualizar
          </button>
        </div>

        <div className="cashier-filters" role="tablist" aria-label="Filtrar por estado">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              className={`cashier-filter${filter === item.value ? ' is-active' : ''}`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
              <span>{counts[item.value].toString().padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="status-message error-message cashier-error" role="alert">
            {error}
          </p>
        )}
        {isLoading && <p className="status-message">Cargando pedidos…</p>}
        {!isLoading && visibleOrders.length === 0 && !error && (
          <p className="status-message cashier-empty">
            <Icon name="list" size={22} />
            No hay pedidos en este estado.
          </p>
        )}

        <div className="cashier-grid">
          {visibleOrders.map((order) => (
            <CashierOrderCard
              key={order.id}
              order={order}
              isUpdating={updatingId === order.id}
              onAdvance={handleAdvance}
              onCancel={handleCancel}
            />
          ))}
        </div>
      </section>

      <footer className="app-footer">
        <span>CAFETERÍA UNIFRANZ</span>
        <span>
          <Icon name="store" size={13} /> {profile?.block.toLocaleUpperCase('es-BO') ?? 'CAJA'}
        </span>
      </footer>
    </main>
  )
}
