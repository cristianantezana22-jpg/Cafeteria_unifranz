import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '../auth/routeAuth'
import { AdminView } from '../views/AdminView'
import { ThemeProvider } from '../theme/ThemeContext'

export const Route = createFileRoute('/admin')({
  ssr: false,
  beforeLoad: () => requireRole('ADMIN'),
  component: ThemedAdminView,
})

function ThemedAdminView() {
  return (
    <ThemeProvider>
      <AdminView />
    </ThemeProvider>
  )
}
