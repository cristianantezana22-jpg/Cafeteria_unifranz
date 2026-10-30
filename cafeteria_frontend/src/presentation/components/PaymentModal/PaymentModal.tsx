import { useState } from 'react'
import './payment-modal.css'

type PaymentModalProps = {
  onClose: () => void
  onConfirm: () => void | Promise<void>
  totalAmount: number
  error?: string
}

export function PaymentModal({ onClose, onConfirm, totalAmount, error }: PaymentModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  async function handleConfirm() {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div
      className="payment-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isConfirming) onClose()
      }}
    >
      <section
        className="payment-modal payment-modal-qr"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <button
          className="payment-modal-close"
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <p className="eyebrow accent">PAGO</p>
        <h2 id="payment-modal-title">Pague aquí</h2>
        <p className="payment-modal-total">Monto a pagar: Bs. {Number(totalAmount).toFixed(2)}</p>
        <div className="payment-modal-qr-wrap">
          <img src="/qr_paga.png" alt="Código QR para pagar" className="payment-modal-qr-image" />
        </div>
        {error && <p className="payment-modal-error" role="alert">{error}</p>}

        <div className="payment-modal-actions">
          <button
            type="button"
            className="payment-modal-cancel"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="payment-modal-confirm"
            onClick={() => void handleConfirm()}
            disabled={isConfirming}
          >
            {isConfirming ? 'Procesando…' : 'Hecho'}
          </button>
        </div>
      </section>
    </div>
  )
}
