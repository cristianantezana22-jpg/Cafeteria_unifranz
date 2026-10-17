import { Link } from '@tanstack/react-router'
import { Button } from '../Button/Button'
import '../LoginForm/login-form.css'
import { useRegisterForm } from './RegisterForm.logic'

export function RegisterForm() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    handleSubmit,
  } = useRegisterForm()

  return (
    <>
      <form className="login-form register-form" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Nombre completo</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label htmlFor="register-email">Correo electrónico</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          maxLength={150}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label htmlFor="register-confirm-password">Confirmar contraseña</label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {error && <p className="form-error" role="alert">{error}</p>}
        <Button
          className="login-button"
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta…' : 'Crear cuenta de cliente'}
          <span aria-hidden="true">↗</span>
        </Button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
      </p>
    </>
  )
}
