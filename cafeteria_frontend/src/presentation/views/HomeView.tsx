import brandLogo from '../assets/pink-paper-logo.svg'
import { LoginForm } from '../components/LoginForm/LoginForm'

export function HomeView() {
  return (
    <main className="auth-layout">
      <section className="auth-image" aria-label="Café recién preparado">
        <div className="brand brand-light">
          <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
        </div>
        <div className="image-caption">
          <span className="eyebrow">HECHO DESPACIO, DISFRUTADO AQUÍ</span>
          <p>
            Un buen día
            <br />
            empieza en la mesa.
          </p>
        </div>
        <span className="image-credit">CAFÉ DE ORIGEN · LA PAZ, BOLIVIA</span>
      </section>

      <section className="auth-panel">
        <div className="auth-content">
          <div className="mobile-brand brand">
            <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
          </div>
          <p className="eyebrow accent">TU MESA TE ESPERA</p>
          <h1>Un gusto verte.</h1>
          <p className="auth-intro">
            Ingresa a tu espacio y descubre lo que preparamos hoy.
          </p>

          <LoginForm />

          <p className="auth-footer">
            CAFETERÍA UNIFRANZ<span>·</span> BUENO, SIMPLE Y HECHO AQUÍ
          </p>
        </div>
      </section>
    </main>
  )
}
