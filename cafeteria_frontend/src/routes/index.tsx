import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { getCurrentSession, loginCustomer } from '../infrastructure/cafeteria'
import brandLogo from '../assets/pink-paper-logo.svg'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('cliente@cafeteria.com')
  const [password, setPassword] = useState('cafe123')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (getCurrentSession()) void navigate({ to: '/cliente' })
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await loginCustomer(email, password)
      await navigate({ to: '/cliente' })
    } catch {
      setError('No pudimos validar tus datos. Revisa el correo y la contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-image" aria-label="Café recién preparado">
        <div className="brand brand-light">
          <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
        </div>
        <div className="image-caption">
          <span className="eyebrow">HECHO DESPACIO, DISFRUTADO AQUÍ</span>
          <p>Un buen día<br />empieza en la mesa.</p>
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
          <p className="auth-intro">Ingresa a tu espacio y descubre lo que preparamos hoy.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button login-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Ingresando…' : 'Entrar a mi cuenta'}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="demo-hint">Acceso de prueba: <strong>cliente@cafeteria.com</strong> · <strong>cafe123</strong></p>
          <p className="auth-footer">CAFETERÍA UNIFRANZ<span>·</span> BUENO, SIMPLE Y HECHO AQUÍ</p>
        </div>
      </section>
    </main>
  )
}
