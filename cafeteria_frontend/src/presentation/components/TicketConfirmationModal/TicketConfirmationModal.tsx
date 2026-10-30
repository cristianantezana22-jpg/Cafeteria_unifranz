import './ticket-confirmation-modal.css'

type TicketConfirmationModalProps = {
  orderNumber: string | number
  onDone: () => void
}

export function TicketConfirmationModal({
  orderNumber,
  onDone,
}: TicketConfirmationModalProps) {
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
        <h2 id="ticket-modal-title">Gracias por tu compra</h2>
        <p className="ticket-order-number">Ticket N° {orderNumber}</p>

        <button className="ticket-done" type="button" onClick={onDone}>
          Aceptar
        </button>
      </section>
    </div>
  )
}
