import { useNavigate } from '@tanstack/react-router'
import {
  getCurrentSession,
  logoutCustomer,
} from '../../../infrastructure/api/cafeteria'

export type RoleHomeProps = {
  eyebrow: string
  title: string
}

export function useRoleHome() {
  const navigate = useNavigate()
  const session = getCurrentSession()

  function handleLogout() {
    logoutCustomer()
    void navigate({ to: '/' })
  }

  return {
    userName: session?.customer.name ?? '',
    handleLogout,
  }
}
