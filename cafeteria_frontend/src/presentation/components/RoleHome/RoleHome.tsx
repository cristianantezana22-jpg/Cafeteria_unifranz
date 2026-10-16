import { Button } from '../Button/Button'
import type { RoleHomeProps } from './RoleHome.logic'
import { useRoleHome } from './RoleHome.logic'
import './role-home.css'

export function RoleHome({ eyebrow, title }: RoleHomeProps) {
  const { userName, handleLogout } = useRoleHome()

  return (
    <main className="role-home">
      <section className="welcome-band">
        <div>
          <p className="eyebrow accent">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="welcome-copy">Sesión iniciada como {userName}.</p>
        </div>
        <div className="role-home-logout">
          <Button variant="outlined" onClick={handleLogout}>
            Cerrar sesión
            <span aria-hidden="true">↗</span>
          </Button>
        </div>
      </section>
    </main>
  )
}
