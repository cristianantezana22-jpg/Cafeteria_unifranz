import { createFileRoute } from '@tanstack/react-router'
import { CustomerView } from '../views/CustomerView'
import { requireRole } from '../auth/routeAuth'

export const Route = createFileRoute('/cliente')({
  ssr: false,
  beforeLoad: () => requireRole('CLIENTE'),
  component: CustomerView,
})
