import { Icon } from '../Icon/Icon'
import type { CashierOrderCardProps } from './CashierOrderCard.logic'
import { getCardDetails } from './CashierOrderCard.logic'
import './cashier-order-card.css'

export function CashierOrderCard({
  order,
  isUpdating,
  onAdvance,
  onCancel,
}: CashierOrderCardProps) {
  const details = getCardDetails(order)

  return (
    <article
      className={`order-card order-card--${order.status.toLowerCase()}`}
      aria-label={`Pedido ${order.ticket}`}
    >
      <header className="order-card__head">
        <div className="order-card__ticket">
          <span className="order-card__ticket-label">
            <Icon name="ticket" size={14} /> TICKET
          </span>
          <strong>{order.ticket}</strong>
        </div>
        <div className="order-card__meta">
          <span className="order-card__status">
            <Icon name={details.statusIcon} size={15} />
            {details.statusLabel}
          </span>
          <span className="order-card__time">
            <Icon name="clock" size={13} /> {details.formattedTime}
          </span>
        </div>
      </header>

      {order.status !== 'CANCELADO' && (
        <ol className="order-steps">
          {details.steps.map((step) => (
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
            </li>
          ))}
        </ol>
      )}

      <div className="order-card__customer">
        <span>
          <Icon name="user" size={14} /> {order.customerName}
        </span>
        <span>
          <Icon name="wallet" size={14} /> {details.paymentLabel}
        </span>
      </div>

      {order.isLunch && (
        <span className="order-card__tag">
          <Icon name="utensils" size={13} /> ALMUERZO
        </span>
      )}

      <ul className="order-card__items">
        {order.items.map((item) => (
          <li key={`${item.name}-${item.quantity}`}>
            <span>
              {item.quantity}× {item.name}
            </span>
            <span>Bs {item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <footer className="order-card__foot">
        <div className="order-card__total">
          <span>TOTAL</span>
          <strong>{details.formattedTotal}</strong>
        </div>

        {details.lockedByBlock && (
          <p className="order-card__locked">
            <Icon name="lock" size={14} /> Solo la caja del Bloque A gestiona almuerzos
          </p>
        )}

        {details.canAdvance && (
          <div className="order-card__actions">
            {details.canCancel && (
              <button
                className="order-card__cancel"
                type="button"
                disabled={isUpdating}
                onClick={() => onCancel(order)}
              >
                <Icon name="x" size={14} /> Rechazar
              </button>
            )}
            <button
              className="order-card__advance"
              type="button"
              disabled={isUpdating}
              onClick={() => onAdvance(order)}
            >
              {isUpdating ? 'Actualizando…' : details.actionLabel}
              <Icon name="arrow-right" size={16} className="icon--inverse" />
            </button>
          </div>
        )}
      </footer>
    </article>
  )
}
