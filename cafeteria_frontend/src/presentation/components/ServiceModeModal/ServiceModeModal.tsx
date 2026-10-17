import type { ServiceMode } from '../../../domain/models/ServiceMode'
import './service-mode-modal.css'

type ServiceModeModalProps = {
  onSelect: (mode: ServiceMode) => void
  onCancel: () => void
}

export function ServiceModeModal({
  onSelect,
  onCancel,
}: ServiceModeModalProps) {
  return (
    <div className="kiosk-step-backdrop">
      <section
        className="service-mode-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-mode-title"
      >
        <p className="eyebrow accent">BIENVENIDO/A</p>
        <h2 id="service-mode-title">¿Cómo disfrutarás tu pedido?</h2>
        <p className="service-mode-copy">Elige una opción para comenzar a ordenar.</p>
        <div className="service-mode-options">
          <button
            className="service-mode-option"
            type="button"
            onClick={() => onSelect('DINE_IN')}
          >
            <span className="service-mode-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z" />
              </svg>
            </span>
            <strong>Para comer aquí</strong>
            <small>Disfruta tu pedido en la cafetería</small>
          </button>
          <button
            className="service-mode-option"
            type="button"
            onClick={() => onSelect('TAKEOUT')}
          >
            <span className="service-mode-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </span>
            <strong>Para llevar</strong>
            <small>Empacaremos tu pedido para llevar</small>
          </button>
        </div>
        <button className="service-mode-cancel" type="button" onClick={onCancel}>
          Volver
        </button>
      </section>
    </div>
  )
}
