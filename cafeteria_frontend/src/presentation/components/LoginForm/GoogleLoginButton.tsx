import { useEffect, useRef } from 'react'

const DEFAULT_GOOGLE_CLIENT_ID =
  '228463936164-cs7n8pp3rcat524hu3qmq23ba58pihqg.apps.googleusercontent.com'
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
      }) => void
      renderButton: (
        element: HTMLElement,
        options: {
          theme: 'outline'
          size: 'large'
          text: 'continue_with'
          shape: 'rectangular'
          width: number
        },
      ) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

type GoogleLoginButtonProps = {
  disabled: boolean
  onCredential: (credential: string) => void
  onError: (message: string) => void
}

export function GoogleLoginButton({
  disabled,
  onCredential,
  onError,
}: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const credentialHandler = useRef(onCredential)
  const errorHandler = useRef(onError)

  credentialHandler.current = onCredential
  errorHandler.current = onError

  useEffect(() => {
    let active = true
    const container = containerRef.current
    if (!container) return

    const renderGoogleButton = () => {
      if (!active || !window.google || !containerRef.current) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            credentialHandler.current(response.credential)
          } else {
            errorHandler.current('Google no devolvió una credencial válida.')
          }
        },
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(container.clientWidth, 400),
      })
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_URL}"]`,
    )
    const onScriptLoad = () => renderGoogleButton()
    const onScriptError = () =>
      errorHandler.current('No se pudo cargar el inicio de sesión de Google.')

    if (window.google) {
      renderGoogleButton()
    } else if (script) {
      script.addEventListener('load', onScriptLoad)
      script.addEventListener('error', onScriptError)
    } else {
      script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_URL
      script.async = true
      script.defer = true
      script.addEventListener('load', onScriptLoad)
      script.addEventListener('error', onScriptError)
      document.head.appendChild(script)
    }

    return () => {
      active = false
      script?.removeEventListener('load', onScriptLoad)
      script?.removeEventListener('error', onScriptError)
    }
  }, [])

  return (
    <div
      className={`google-login-button${disabled ? ' google-login-button--disabled' : ''}`}
      ref={containerRef}
      aria-label="Iniciar sesión con Google"
      aria-disabled={disabled}
    />
  )
}
