import { createFileRoute } from '@tanstack/react-router'
import brandLogo from '../assets/pink-paper-logo.svg'
import { RegisterForm } from '../components/RegisterForm/RegisterForm'

export const Route = createFileRoute('/registro')({
  component: RegisterView,
})

function RegisterView() {
  return (
    <main className="auth-layout">
      <section className="auth-image" aria-label="Café recién preparado">
        <div className="brand brand-light">
          <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
        </div>
        <div className="image-caption">
          <span className="eyebrow">HECHO DESPACIO, DISFRUTADO AQUÍ</span>
          <p>
            Tu próximo
            <br />
            café empieza aquí.
          </p>
        </div>
        <span className="image-credit">CAFÉ DE ORIGEN · LA PAZ, BOLIVIA</span>
      </section>

      <section className="auth-panel">
        <div className="auth-content">
          <div className="mobile-brand brand">
            <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
          </div>
          <p className="eyebrow accent">ÚNETE A NUESTRA MESA</p>
          <h1>Crea tu cuenta.</h1>
          <p className="auth-intro">
            Regístrate como cliente para descubrir el menú y hacer tus pedidos.
          </p>

          <RegisterForm />

          <p className="auth-footer">
            CAFETERÍA UNIFRANZ<span>·</span> BUENO, SIMPLE Y HECHO AQUÍ
          </p>
        </div>
      </section>
    </main>
  )
}
