<<<<<<< HEAD
import { createGetFeaturedProducts } from '../../application/use-cases/getFeaturedProducts'
import { createLoginCustomer } from '../../application/use-cases/loginCustomer'
import { createPlaceCustomerOrder } from '../../application/use-cases/placeCustomerOrder'
import { createRegisterCustomer } from '../../application/use-cases/registerCustomer'
import { HttpCafeteriaGateway } from './HttpCafeteriaGateway'
import { LocalSessionRepository } from '../repositories/LocalSessionRepository'
import type { CustomerSession } from '../../domain/models'
=======
import { createGetCashierOrders } from '../../application/use-cases/getCashierOrders'
import { createGetCashierProfile } from '../../application/use-cases/getCashierProfile'
import { createLoginCashier } from '../../application/use-cases/loginCashier'
import { createUpdateCashierOrderStatus } from '../../application/use-cases/updateCashierOrderStatus'
import type { MenuProductRequest } from '../../domain/models'
import { HttpCafeteriaGateway } from './HttpCafeteriaGateway'
import { LocalSessionRepository } from '../repositories/LocalSessionRepository'
>>>>>>> alan

const gateway = new HttpCafeteriaGateway()
const sessions = new LocalSessionRepository()

<<<<<<< HEAD
export const loginCustomer = createLoginCustomer(gateway, sessions)
export const registerCustomer = createRegisterCustomer(gateway, sessions)
export const getFeaturedProducts = createGetFeaturedProducts(gateway, sessions)
export const placeCustomerOrder = createPlaceCustomerOrder(gateway, sessions)
export const getCurrentSession = () => sessions.get()
export const saveCustomerSession = (session: CustomerSession) =>
  sessions.save(session)
export const getProducts = async () => {
  return gateway.getProducts()
}
export const getCategories = async () => {
  return gateway.getCategories()
}
export const logoutCustomer = () => sessions.clear()
=======
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
>>>>>>> alan
