import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  getCurrentSession,
  loginCustomer,
} from '../../../infrastructure/api/cafeteria'

export function useLoginForm() {
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
