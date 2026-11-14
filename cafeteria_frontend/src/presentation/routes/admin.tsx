import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '../auth/routeAuth'
import { AdminView } from '../views/AdminView'

export const Route = createFileRoute('/admin')({
  ssr: false,
  beforeLoad: () => requireRole('ADMIN'),
  component: AdminView,
})
