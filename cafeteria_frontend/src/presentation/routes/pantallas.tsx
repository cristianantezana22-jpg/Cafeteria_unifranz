import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '../auth/routeAuth'
import { ScreensView } from '../views/ScreensView'

export const Route = createFileRoute('/pantallas')({
  ssr: false,
  beforeLoad: () => requireRole('PANTALLA'),
  component: ScreensView,
})
