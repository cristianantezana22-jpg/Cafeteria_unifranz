import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '../auth/routeAuth'
import { CashierView } from '../views/CashierView'

export const Route = createFileRoute('/cajero')({
  beforeLoad: () => requireRole('CAJERO'),
  component: CashierView,
})
