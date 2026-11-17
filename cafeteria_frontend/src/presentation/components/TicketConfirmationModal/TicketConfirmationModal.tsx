import type { CustomerOrder, OrderStatus } from '../../../domain/models'
import type { PaymentMethod } from '../../../domain/models/Payment'
import type { ServiceMode } from '../../../domain/models/ServiceMode'
import { STATUS_LABELS } from '../CashierOrderCard/CashierOrderCard.logic'
import './ticket-confirmation-modal.css'

type TicketConfirmationModalProps = {
  orderNumber: string | number
  orderStatus: OrderStatus
  items: CustomerOrder['items']
  total: number
  serviceMode: ServiceMode
  paymentMethod: PaymentMethod
  isAwaitingPayment?: boolean
  onDone: () => void
}

const paymentLabels: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  QR: 'QR',
  TARJETA: 'Tarjeta',
  YA_PAGO: 'Ya pagó',
}

export function TicketConfirmationModal({
  orderNumber,
  orderStatus,
  items,
  total,
  serviceMode,
  paymentMethod,
  isAwaitingPayment = false,
  onDone,
}: TicketConfirmationModalProps) {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="ticket-modal-backdrop">
      <section
        className="ticket-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
      >
        <span className={`ticket-success-icon${isAwaitingPayment ? ' is-pending' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            {isAwaitingPayment ? (
              <>
                <path d="M3 7h18v13H3z" />
                <path d="M3 10h18M7 4v3m10-3v3" />
              </>
            ) : (
              <path d="m5 12 4.5 4.5L19 7" />
            )}
          </svg>
        </span>
        <p className="eyebrow accent">{isAwaitingPayment ? 'PAGO PENDIENTE' : 'PEDIDO REGISTRADO'}</p>
        <h2 id="ticket-modal-title">
          {isAwaitingPayment ? 'Paga en caja' : 'Gracias por tu pedido'}
        </h2>
        <p className="ticket-order-number">
          {isAwaitingPayment ? 'Tu ticket se mostrará al confirmar el pago' : `Ticket ${orderNumber}`}
        </p>
        <p className="ticket-current-status" role="status">
          Estado: {isAwaitingPayment ? 'Esperando confirmación del cajero' : STATUS_LABELS[orderStatus]}
        </p>

        <div className="ticket-summary">
          <div className="ticket-summary-heading">
            <strong>Resumen</strong>
            <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
          </div>
          <ul>
            {items.slice(0, 4).map((item) => (
              <li key={item.productId}>
                <span>{item.quantity} × {item.name}</span>
                <strong>Bs {Number(item.subtotal).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          {items.length > 4 && (
            <p className="ticket-more-items">y {items.length - 4} producto(s) más</p>
          )}
          <div className="ticket-summary-meta">
            <span>{serviceMode === 'DINE_IN' ? 'Para comer aquí' : 'Para llevar'}</span>
            <span>Pago: {paymentLabels[paymentMethod]}</span>
          </div>
          <div className="ticket-total">
            <span>Total del pedido</span>
            <strong>Bs {Number(total).toFixed(2)}</strong>
          </div>
        </div>

        {isAwaitingPayment ? (
          <p className="ticket-reset-note">Mantén esta pantalla abierta. El ticket aparecerá cuando el cajero confirme tu pago.</p>
        ) : (
          <>
            <p className="ticket-reset-note">La pantalla volverá al inicio en unos segundos.</p>
            <button className="ticket-done" type="button" onClick={onDone}>
              Listo
            </button>
          </>
        )}
      </section>
    </div>
  )
}