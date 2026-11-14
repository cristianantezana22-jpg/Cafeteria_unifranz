import type { CustomerOrder } from '../../../domain/models'
import { QRCodeSVG } from 'qrcode.react'
import './ticket-confirmation-modal.css'

type TicketConfirmationModalProps = {
  ticketCode: string
  qrValue: string
  items: CustomerOrder['items']
  total: number
  onDone: () => void
}

export function TicketConfirmationModal({
  ticketCode,
  qrValue,
  items,
  total,
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
        <span className="ticket-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="m5 12 4.5 4.5L19 7" /></svg>
        </span>
        <p className="eyebrow accent">PEDIDO REGISTRADO</p>
        <h2 id="ticket-modal-title">Tu ticket</h2>
        <p className="ticket-order-number">{ticketCode}</p>
        <div className="ticket-qr">
          <QRCodeSVG value={qrValue} size={230} level="H" includeMargin />
        </div>
        <p className="ticket-qr-caption">¡Escanea el QR para el recibo!</p>
        <p className="ticket-total">
          <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'} · Total</span>
          <strong>Bs {Number(total).toFixed(2)}</strong>
        </p>
        <button className="ticket-done" type="button" onClick={onDone}>
          Aceptar
        </button>
      </section>
    </div>
  )
}