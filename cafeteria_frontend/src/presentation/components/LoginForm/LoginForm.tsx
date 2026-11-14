import { Button } from '../Button/Button'
import { GoogleLoginButton } from './GoogleLoginButton'
import { useLoginForm } from './LoginForm.logic'
import './login-form.css'

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
    handleGoogleCredential,
    setError,
  } = useLoginForm()

  return (
    <>
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
        <Button
          className="login-button"
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando…' : 'Entrar a mi cuenta'}
          <span aria-hidden="true">↗</span>
        </Button>
      </form>
      <div className="google-login">
        <div className="google-login__divider"><span>o continúa con</span></div>
        <GoogleLoginButton
          disabled={isLoading}
          onCredential={handleGoogleCredential}
          onError={setError}
        />
      </div>
    </>
  )
}
