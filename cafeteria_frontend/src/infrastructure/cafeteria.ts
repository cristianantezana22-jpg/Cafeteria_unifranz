import { createGetFeaturedProducts } from '../application/use-cases/getFeaturedProducts'
import { createLoginCustomer } from '../application/use-cases/loginCustomer'
import { createPlaceCustomerOrder } from '../application/use-cases/placeCustomerOrder'
import { HttpCafeteriaGateway } from './api/HttpCafeteriaGateway'
import { LocalSessionRepository } from './session/LocalSessionRepository'

const gateway = new HttpCafeteriaGateway()
const sessions = new LocalSessionRepository()

export const loginCustomer = createLoginCustomer(gateway, sessions)
export const getFeaturedProducts = createGetFeaturedProducts(gateway, sessions)
export const placeCustomerOrder = createPlaceCustomerOrder(gateway, sessions)
export const getCurrentSession = () => sessions.get()
export const logoutCustomer = () => sessions.clear()