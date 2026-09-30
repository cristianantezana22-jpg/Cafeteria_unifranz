import type { CafeteriaGateway } from '../ports/CafeteriaGateway'
import type { SessionRepository } from '../ports/SessionRepository'

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