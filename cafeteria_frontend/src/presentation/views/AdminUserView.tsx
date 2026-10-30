import { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  nombreCompleto?: string;
  nombre?: string;
  email: string;
  rol: string;
}

interface Props {
  /** true (por defecto): muestra cabecera y menú lateral propios.
   *  false: muestra solo el contenido, para usarlo dentro de un layout que ya tenga cabecera y menú. */
  conMarco?: boolean;
}

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export function AdminUsersView({ conMarco = true }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt') || '';
    fetch('http://localhost:8080/api/admin/usuarios', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          setUsuarios([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
        setUsuarios([]);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt') || '';
        await fetch(`http://localhost:8080/api/admin/usuarios/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        setUsuarios(usuarios.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  const contenido = (
    <>
      <div className="au-bar">
        <div>
          <h2 className="au-bar-title">Pantalla de Gestión de Usuarios</h2>
          <p className="au-bar-sub">Consulta y administra las cuentas registradas en el sistema</p>
        </div>
        <a href="/admin" className="au-back">
          <span aria-hidden="true">←</span> Volver al Inicio
        </a>
      </div>

      <section className="au-card">
        <div className="au-card-head">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Usuarios registrados
            {!loading && <span className="au-count">{usuarios.length}</span>}
          </h3>
        </div>

        {loading ? (
          <div className="au-loading">
            <span className="au-spinner" />
            <p>Cargando datos del sistema...</p>
          </div>
        ) : (
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((user) => {
                    const nombre = user.nombreCompleto || user.nombre || 'Sin nombre';
                    const esAdmin = user.rol?.toLowerCase().includes('admin');
                    return (
                      <tr key={user.id}>
                        <td className="au-id">#{user.id}</td>
                        <td>
                          <div className="au-user">
                            <span className="au-avatar">{iniciales(nombre) || '?'}</span>
                            <span className="au-name">{nombre}</span>
                          </div>
                        </td>
                        <td className="au-mail">{user.email}</td>
                        <td>
                          <span className={`au-role ${esAdmin ? 'admin' : ''}`}>{user.rol}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDelete(user.id)} className="au-delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            </svg>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="au-empty">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                        </svg>
                        <span>No hay usuarios registrados.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  return (
    <div className="au">
      <style>{CSS}</style>

      {conMarco ? (
        <>
          <header className="au-hero">
            <div className="au-wrap">
              <span className="au-eyebrow">Administración</span>
              <h1>Gestión de usuarios</h1>
              <p>Panel de administrador</p>
            </div>
          </header>

          <div className="au-wrap au-shell">
            <aside className="au-side">
              <span className="au-side-heading">Navegación</span>
              <nav className="au-nav">
                <a href="/admin" className="au-nav-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
                  </svg>
                  Inicio Admin
                </a>
                <span className="au-nav-item active" aria-current="page">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Gestión de usuarios
                </span>
              </nav>
            </aside>

            <main className="au-content">{contenido}</main>
          </div>
        </>
      ) : (
        <div className="au-embedded">{contenido}</div>
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

.au, .au * { box-sizing: border-box; }
.au {
  --brand: #a80097;
  --brand-2: #8a00d4;
  --bg: #f6f7fb;
  --card: #ffffff;
  --border: #e8eaf1;
  --text: #1f2430;
  --muted: #6b7280;
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  min-height: 100vh;
}
.au h1, .au h2, .au h3, .au p { margin: 0; }
.au a { text-decoration: none; }
.au-wrap { width: 100%; max-width: 1440px; margin: 0 auto; padding: 0 32px; }
.au-embedded { padding: 0; background: transparent; }

/* Cabecera */
.au-hero {
  position: relative; overflow: hidden; color: #fff;
  background: linear-gradient(120deg, #a80097 0%, #9a00b8 100%);
  padding: 34px 0 86px;
}
.au-hero::before, .au-hero::after { content: ''; position: absolute; border-radius: 50%; pointer-events: none; border: 44px solid rgba(255,255,255,0.07); }
.au-hero::before { width: 520px; height: 520px; right: 8%; top: -300px; }
.au-hero::after { width: 340px; height: 340px; right: -60px; top: -120px; }
.au-hero .au-wrap { position: relative; z-index: 1; }
.au-eyebrow { display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; opacity: .92; margin-bottom: 8px; }
.au-hero h1 { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 46px; line-height: 1.05; }
.au-hero p { margin-top: 10px; opacity: .88; }

/* Cuerpo */
.au-shell { position: relative; z-index: 2; display: grid; grid-template-columns: 270px minmax(0, 1fr); gap: 26px; align-items: start; margin-top: -48px; padding-bottom: 56px; }
.au-side { position: sticky; top: 20px; background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 18px 14px; box-shadow: 0 18px 40px -26px rgba(30,20,60,0.35); }
.au-side-heading { display: block; padding: 4px 10px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9aa1b2; }
.au-nav { display: flex; flex-direction: column; gap: 4px; }
.au-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; color: #3b4252; font-size: 14px; font-weight: 500; transition: background .18s, color .18s; }
.au-nav-item:hover { background: #f3eefb; color: var(--brand-2); }
.au-nav-item.active { background: var(--brand-2); color: #fff; font-weight: 600; box-shadow: 0 12px 24px -12px rgba(138,0,212,0.8); }
.au-content { min-width: 0; padding-top: 48px; }

/* Barra de título */
.au-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.au-bar-title { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
.au-bar-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }
.au-back { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; background: #fff; border: 1px solid var(--border); color: var(--text); font-size: 13px; font-weight: 600; transition: transform .15s, background .2s, border-color .2s; }
.au-back:hover { background: #f3eefb; border-color: #d9b8f4; color: var(--brand-2); transform: translateY(-1px); }

/* Card + tabla */
.au-card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px -26px rgba(30,20,60,0.5); min-width: 0; }
.au-card-head { margin-bottom: 14px; }
.au-card-head h3 { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
.au-card-head svg { color: var(--brand); }
.au-count { font-size: 12px; font-weight: 700; padding: 2px 9px; border-radius: 20px; background: #f1f2f7; color: var(--muted); }
.au-table-wrap { overflow-x: auto; }
.au-table { width: 100%; border-collapse: collapse; text-align: left; }
.au-table th { padding: 10px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #8a91a3; border-bottom: 1px solid var(--border); white-space: nowrap; }
.au-table td { padding: 14px; border-bottom: 1px solid #f0f1f6; vertical-align: middle; white-space: nowrap; }
.au-table tbody tr { transition: background .15s; }
.au-table tbody tr:hover { background: #faf7fd; }
.au-table tbody tr:last-child td { border-bottom: 0; }
.au-id { color: var(--muted); font-variant-numeric: tabular-nums; }
.au-mail { color: var(--muted); }
.au-user { display: flex; align-items: center; gap: 12px; }
.au-avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; font-size: 12px; font-weight: 700; color: #fff; background: linear-gradient(135deg, var(--brand), var(--brand-2)); }
.au-name { font-weight: 600; }
.au-role { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #f1f2f7; color: #4b5263; }
.au-role.admin { background: #f9e5f6; color: var(--brand); }
.au-delete { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border: 1px solid #fecdd3; border-radius: 9px; background: #fff1f2; color: #be123c; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .2s, color .2s, transform .15s; }
.au-delete:hover { background: #e11d48; border-color: #e11d48; color: #fff; transform: translateY(-1px); }
.au :focus-visible { outline: 2px solid var(--brand-2); outline-offset: 2px; }

/* Cargando / vacío */
.au-loading { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 48px 0; color: var(--muted); }
.au-spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid #eadcf7; border-top-color: var(--brand-2); animation: au-spin .8s linear infinite; }
.au-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 0; color: var(--muted); font-size: 13px; }
@keyframes au-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .au * { animation-duration: 2s !important; transition: none !important; } }

/* Responsive */
@media (max-width: 1024px) {
  .au-shell { grid-template-columns: 1fr; margin-top: -40px; }
  .au-side { position: static; padding: 12px; }
  .au-side-heading { display: none; }
  .au-nav { flex-direction: row; overflow-x: auto; }
  .au-nav-item { white-space: nowrap; flex-shrink: 0; }
  .au-content { padding-top: 0; }
}
@media (max-width: 700px) {
  .au-wrap { padding: 0 16px; }
  .au-hero { padding: 26px 0 74px; }
  .au-hero h1 { font-size: 32px; }
  .au-card { padding: 16px; }
}
`