import { createFileRoute } from '@tanstack/react-router'
import { CustomerView } from '../views/CustomerView'
import { requireRole } from '../auth/routeAuth'
import { ThemeProvider } from '../theme/ThemeContext'

export const Route = createFileRoute('/cliente')({
  beforeLoad: () => requireRole('CLIENTE'),
  component: ThemedCustomerView,
})

function ThemedCustomerView() {
  return (
    <ThemeProvider>
      <CustomerView />
    </ThemeProvider>
  )
}
