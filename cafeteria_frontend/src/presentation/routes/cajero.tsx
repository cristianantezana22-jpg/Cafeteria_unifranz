import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '../auth/routeAuth'
import { CashierView } from '../views/CashierView'
import { ThemeProvider } from '../theme/ThemeContext'

export const Route = createFileRoute('/cajero')({
  ssr: false,
  beforeLoad: () => requireRole('CAJERO'),
  component: ThemedCashierView,
})

function ThemedCashierView() {
  return (
    <ThemeProvider>
      <CashierView />
    </ThemeProvider>
  )
}
