import { createGetCashierOrders } from '../../application/use-cases/getCashierOrders'
import { createGetCashierProfile } from '../../application/use-cases/getCashierProfile'
import { createLoginCashier } from '../../application/use-cases/loginCashier'
import { createUpdateCashierOrderStatus } from '../../application/use-cases/updateCashierOrderStatus'
import type { MenuProductRequest } from '../../domain/models'
import { HttpCafeteriaGateway } from './HttpCafeteriaGateway'
import { LocalSessionRepository } from '../repositories/LocalSessionRepository'

const gateway = new HttpCafeteriaGateway()
const sessions = new LocalSessionRepository()

export const loginCashier = createLoginCashier(gateway, sessions)
export const getMenuProducts = () => {
  const session = sessions.get()
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  return gateway.getMenuProducts(session.token)
}
export const getMenuCategories = () => {
  const session = sessions.get()
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  return gateway.getMenuCategories(session.token)
}
export const createMenuProduct = (
  product: MenuProductRequest,
) => {
  const session = sessions.get()
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  return gateway.createMenuProduct(session.token, product)
}
export const updateMenuProduct = (
  productId: string,
  product: MenuProductRequest,
) => {
  const session = sessions.get()
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  return gateway.updateMenuProduct(session.token, productId, product)
}
export const deleteMenuProduct = (productId: string) => {
  const session = sessions.get()
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  return gateway.deleteMenuProduct(session.token, productId)
}
export const getCashierProfile = createGetCashierProfile(gateway, sessions)
export const getCashierOrders = createGetCashierOrders(gateway, sessions)
export const updateCashierOrderStatus = createUpdateCashierOrderStatus(
  gateway,
  sessions,
)
export const getCurrentSession = () => sessions.get()
export const logoutCashier = () => sessions.clear()