import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { loginCashier } from '../../../infrastructure/api/cafeteria'
import { getRolePath } from '../../auth/routeAuth'

export function useLoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const session = await loginCashier(email, password)
      await navigate({ to: getRolePath(session.role) })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No pudimos validar tus datos. Revisa el correo y la contraseña.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  }
}
