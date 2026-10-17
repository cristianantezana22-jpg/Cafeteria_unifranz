<<<<<<< HEAD
import { Link } from '@tanstack/react-router'
=======
>>>>>>> alan
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
<<<<<<< HEAD
            Ingresa a tu espacio y descubre lo que preparamos hoy.
          </p>

          <LoginForm />
          <p className="auth-switch">¿Aún no tienes cuenta?</p>
          <Link className="button button--outlined auth-register-button" to="/registro">
            Regístrate
            <span aria-hidden="true">↗</span>
          </Link>

          <p className="auth-footer">
            CAFETERÍA UNIFRANZ<span>·</span> BUENO, SIMPLE Y HECHO AQUÍ
=======
            Ingresa a tu espacio de caja para gestionar pedidos y menú.
          </p>

          <LoginForm />

          <p className="auth-footer">
            CAFETERÍA UNIFRANZ<span>·</span> ACCESO PARA PERSONAL DE CAJA
>>>>>>> alan
          </p>
        </div>
      </section>
    </main>
  )
}
