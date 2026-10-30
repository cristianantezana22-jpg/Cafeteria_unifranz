import { useState } from 'react'
import type { PaymentMethod } from '../../../domain/models/Payment'
import './payment-modal.css'

type PaymentModalProps = {
  onClose: () => void
  onConfirm: (method: PaymentMethod) => void | Promise<void>
  error?: string
}

export function PaymentModal({ onClose, onConfirm, error }: PaymentModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  async function handleConfirm(method: PaymentMethod) {
    setIsConfirming(true)
    try {
      await onConfirm(method)
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
        className="payment-modal"
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
        <p className="eyebrow accent">UN ÚLTIMO PASO</p>
        <h2 id="payment-modal-title">¿Cómo quieres pagar?</h2>
        <p className="payment-modal-copy">Elige tu método de pago para confirmar el pedido.</p>
        {error && <p className="payment-modal-error" role="alert">{error}</p>}
        <div className="payment-modal-options">
          <button
            className="payment-option"
            type="button"
            onClick={() => void handleConfirm('QR')}
            disabled={isConfirming}
          >
            <span className="payment-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
                <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
              </svg>
            </span>
            <span><strong>{isConfirming ? 'Procesando…' : 'Pagar con QR'}</strong><small>Escanea y paga desde tu banco</small></span>
            <span className="payment-option-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
            </span>
          </button>
          <button
            className="payment-option"
            type="button"
            onClick={() => void handleConfirm('EFECTIVO')}
            disabled={isConfirming}
          >
            <span className="payment-option-icon payment-option-text-icon" aria-hidden="true">Bs</span>
            <span><strong>Pagar en efectivo</strong><small>Paga en caja al recoger tu pedido</small></span>
            <span className="payment-option-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
            </span>
          </button>
          <button
            className="payment-option"
            type="button"
            onClick={() => void handleConfirm('TARJETA')}
            disabled={isConfirming}
          >
            <span className="payment-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
            </span>
            <span><strong>Pagar con tarjeta</strong><small>Débito o crédito en caja</small></span>
            <span className="payment-option-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
