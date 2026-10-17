import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createRegisterCustomer(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (name: string, email: string, password: string) => {
    const session = await gateway.register(name, email, password)
    if (session.role !== 'CLIENTE') {
      throw new Error('El registro solo está disponible para clientes.')
    }
    sessions.save(session)
    return session
  }
}
