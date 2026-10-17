import type { CafeteriaGateway } from '../services/CafeteriaGateway'
import type { SessionRepository } from '../services/SessionRepository'

export function createLoginCashier(
  gateway: CafeteriaGateway,
  sessions: SessionRepository,
) {
  return async (email: string, password: string) => {
    const session = await gateway.login(email, password)
    sessions.save(session)
    return session
  }
}