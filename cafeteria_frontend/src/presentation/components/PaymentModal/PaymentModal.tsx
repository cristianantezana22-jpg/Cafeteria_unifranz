import { useState } from 'react'
import type { PaymentMethod } from '../../../domain/models/Payment'
import qrPaymentImage from '../../../../qr-pago.png'
import './payment-modal.css'

type PaymentModalProps = {
  variant: 'customer' | 'screen'
  onClose: () => void
  onConfirm: (method: PaymentMethod) => void | Promise<void>
  error?: string
}

const paymentMethods: Record<PaymentModalProps['variant'], PaymentMethod[]> = {
  customer: ['QR'],
  screen: ['QR', 'EFECTIVO'],
}

export function PaymentModal({ variant, onClose, onConfirm, error }: PaymentModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QR')
  const methods = paymentMethods[variant]

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
        <div className="payment-modal-heading">
          <span className="payment-modal-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
              <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
            </svg>
          </span>
        </div>
        <h2 id="payment-modal-title">
          {variant === 'customer' ? 'Paga con QR' : 'Elige cómo pagar'}
        </h2>
        <p className="payment-modal-copy">
          {variant === 'customer'
            ? 'Escanea el código desde la aplicación de tu banco.'
            : 'Selecciona el método de pago para continuar.'}
        </p>
        {error && <p className="payment-modal-error" role="alert">{error}</p>}
        <div className="payment-modal-options">
          {methods.map((method) => {
            const isQr = method === 'QR'
            const isSelected = selectedMethod === method

            return (
              <button
                className={`payment-option${isSelected ? ' is-selected' : ''}`}
                type="button"
                key={method}
                onClick={() => setSelectedMethod(method)}
                disabled={isConfirming}
                aria-pressed={isSelected}
              >
                <span className="payment-option-icon" aria-hidden="true">
                  {isQr ? (
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
                      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
                    </svg>
                  ) : (
                    <span className="payment-option-text-icon">Bs</span>
                  )}
                </span>
                <span className="payment-option-label">
                  <strong>{isQr ? 'Pago con QR' : 'Pago en efectivo'}</strong>
                  <small>
                    {isQr ? 'Escanea y paga desde tu banco' : 'Paga en caja al recoger tu pedido'}
                  </small>
                </span>
                <span className="payment-option-selection" aria-hidden="true">
                  {isSelected && <span />}
                </span>
              </button>
            )
          })}
        </div>
        {selectedMethod === 'QR' && (
          <div className="payment-qr-panel">
            <img src={qrPaymentImage} alt="Código QR para realizar el pago" />
            <p>Escanea el código QR con la aplicación de tu banco.</p>
          </div>
        )}
        <button
          className="payment-confirm-button"
          type="button"
          onClick={() =>
            void handleConfirm(selectedMethod === 'QR' ? 'YA_PAGO' : selectedMethod)
          }
          disabled={isConfirming}
        >
          {isConfirming ? 'Procesando pedido…' : 'Ya pagué'}
          {!isConfirming && <span aria-hidden="true">→</span>}
        </button>
      </section>
    </div>
  )
}