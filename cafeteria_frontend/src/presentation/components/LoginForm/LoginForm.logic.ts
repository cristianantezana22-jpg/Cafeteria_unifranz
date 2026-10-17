import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  loginCustomer,
  saveCustomerSession,
} from '../../../infrastructure/api/cafeteria'
import type { CustomerSession } from '../../../domain/models'
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
      if (email.trim().toLowerCase().includes('pantalla')) {
        const session: CustomerSession = {
          token: 'development-kiosk-session',
          customer: {
            id: 'development-screen',
            name: 'Pantalla de pedidos',
            email: email.trim().toLowerCase(),
          },
          role: 'PANTALLA',
        }

        saveCustomerSession(session)
        await navigate({ to: '/pantallas' })
        return
      }

      const session = await loginCustomer(email, password)
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