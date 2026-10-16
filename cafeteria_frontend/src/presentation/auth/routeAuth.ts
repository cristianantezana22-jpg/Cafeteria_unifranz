import { redirect } from '@tanstack/react-router'
import type { UserRole } from '../../domain/models'
import { getCurrentSession } from '../../infrastructure/api/cafeteria'

export function getRolePath(role: UserRole) {
  switch (role) {
    case 'CLIENTE':
      return '/cliente' as const
    case 'CAJERO':
      return '/cajero' as const
    case 'ADMIN':
      return '/admin' as const
    case 'PANTALLA':
      return '/pantallas' as const
  }
}

export function requireRole(role: UserRole) {
  const session = getCurrentSession()
  if (!session) throw redirect({ to: '/' })
  if (session.role !== role) throw redirect({ to: getRolePath(session.role) })
}
