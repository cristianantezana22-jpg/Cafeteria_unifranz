import './screensaver.css'

type ScreensaverProps = {
  onStart: () => void
}

export function Screensaver({ onStart }: ScreensaverProps) {
  return (
    <main
      className="screensaver"
      aria-label="Pantalla de bienvenida"
      onClick={onStart}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onStart()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="screensaver-orb screensaver-orb-one" aria-hidden="true" />
      <div className="screensaver-orb screensaver-orb-two" aria-hidden="true" />
      <div className="screensaver-orb screensaver-orb-three" aria-hidden="true" />
      <section className="screensaver-card">
        <span className="screensaver-brand">CAFETERÍA UNIFRANZ</span>
        <span className="screensaver-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" focusable="false">
            <path d="M16 3.5 18.8 13.2 28.5 16l-9.7 2.8L16 28.5l-2.8-9.7L3.5 16l9.7-2.8L16 3.5Z" />
          </svg>
        </span>
        <h1>Un momento para ti.</h1>
        <p>Toca la pantalla en cualquier lugar para ordenar</p>
        <span className="screensaver-hint" aria-hidden="true">TOCA PARA COMENZAR</span>
      </section>
    </main>
  )
}
