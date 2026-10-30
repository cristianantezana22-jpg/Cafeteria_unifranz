import { createGetFeaturedProducts } from '../../application/use-cases/getFeaturedProducts'
import { createGetCashierOrders } from '../../application/use-cases/getCashierOrders'
import { createGetCashierProfile } from '../../application/use-cases/getCashierProfile'
import { createLoginCustomer } from '../../application/use-cases/loginCustomer'
import { createPlaceCustomerOrder } from '../../application/use-cases/placeCustomerOrder'
import { createRegisterCustomer } from '../../application/use-cases/registerCustomer'
import { createUpdateCashierOrderStatus } from '../../application/use-cases/updateCashierOrderStatus'
import { HttpCafeteriaGateway } from './HttpCafeteriaGateway'
import { LocalSessionRepository } from '../repositories/LocalSessionRepository'
import type { CustomerSession, MenuProductRequest } from '../../domain/models'

const gateway = new HttpCafeteriaGateway()
const sessions = new LocalSessionRepository()

export const loginCustomer = createLoginCustomer(gateway, sessions)
export const registerCustomer = createRegisterCustomer(gateway, sessions)
export const getFeaturedProducts = createGetFeaturedProducts(gateway, sessions)
export const getCashierOrders = createGetCashierOrders(gateway, sessions)
export const getCashierProfile = createGetCashierProfile(gateway, sessions)
export const updateCashierOrderStatus = createUpdateCashierOrderStatus(
  gateway,
  sessions,
)
function requireSessionToken() {
  const session = sessions.get()
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  return session.token
}

export const getMenuProducts = () => gateway.getMenuProducts(requireSessionToken())
export const getMenuCategories = () =>
  gateway.getMenuCategories(requireSessionToken())
export const createMenuProduct = (request: MenuProductRequest) =>
  gateway.createMenuProduct(requireSessionToken(), request)
export const updateMenuProduct = (
  productId: string,
  request: MenuProductRequest,
) => gateway.updateMenuProduct(requireSessionToken(), productId, request)
export const deleteMenuProduct = (productId: string) =>
  gateway.deleteMenuProduct(requireSessionToken(), productId)
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
export const logoutCashier = logoutCustomer
