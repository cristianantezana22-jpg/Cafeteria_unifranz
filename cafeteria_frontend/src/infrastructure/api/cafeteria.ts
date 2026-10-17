import { createGetFeaturedProducts } from '../../application/use-cases/getFeaturedProducts'
import { createLoginCustomer } from '../../application/use-cases/loginCustomer'
import { createPlaceCustomerOrder } from '../../application/use-cases/placeCustomerOrder'
import { createRegisterCustomer } from '../../application/use-cases/registerCustomer'
import { HttpCafeteriaGateway } from './HttpCafeteriaGateway'
import { LocalSessionRepository } from '../repositories/LocalSessionRepository'
import type { CustomerSession } from '../../domain/models'

const gateway = new HttpCafeteriaGateway()
const sessions = new LocalSessionRepository()

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
