import { redirect } from '@tanstack/react-router'
import type { UserRole } from '../../domain/models'
import { getCurrentSession } from '../../infrastructure/api/cafeteria'

export function getRolePath(role: UserRole) {
  if (role !== 'CAJERO') throw new Error('Solo el personal de caja puede iniciar sesión.')
  return '/cajero' as const
}

export function requireRole(role: UserRole) {
  const session = getCurrentSession()
  if (!session) throw redirect({ to: '/' })
  if (session.role !== role) throw redirect({ to: getRolePath(session.role) })
}
