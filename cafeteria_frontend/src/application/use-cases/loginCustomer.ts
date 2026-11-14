import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createLoginCustomer(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (email: string, password: string) => {
    const session = await gateway.login(email, password)
    sessions.save(session)
    return session
  }
}

export function createLoginKiosk(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async () => {
    const session = await gateway.loginKiosk()
    sessions.save(session)
    return session
  }
}