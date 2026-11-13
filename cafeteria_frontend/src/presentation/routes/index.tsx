import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentSession } from '../../infrastructure/api/cafeteria'
import { getRolePath } from '../auth/routeAuth'
import { HomeView } from '../views/HomeView'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const session = getCurrentSession()
    if (session) throw redirect({ to: getRolePath(session.role) })
  },
  component: HomeView,
})
