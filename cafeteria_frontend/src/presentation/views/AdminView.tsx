import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { RoleHome } from '../components/RoleHome/RoleHome'
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle'
import jsPDF from 'jspdf'
// @ts-ignore
import autoTable from 'jspdf-autotable'
// @ts-ignore
import * as XLSX from 'xlsx'

const API = 'http://localhost:8080/api/admin'

// Busca el token JWT guardado por el login: claves comunes y objetos JSON ({ token: '...' }),
// tanto en localStorage como en sessionStorage.
const CLAVES_TOKEN = ['token', 'jwt', 'accessToken', 'access_token', 'authToken', 'auth_token']

const leerToken = (): string | null => {
  for (const store of [localStorage, sessionStorage]) {
    for (const clave of CLAVES_TOKEN) {
      const valor = store.getItem(clave)
      if (valor) return valor.replace(/^"|"$/g, '')
    }
    for (let i = 0; i < store.length; i++) {
      const raw = store.getItem(store.key(i) ?? '')
      if (!raw || raw[0] !== '{') continue
      try {
        const obj = JSON.parse(raw) as Record<string, unknown>
        const t = obj.token ?? obj.accessToken ?? obj.jwt
        if (typeof t === 'string' && t) return t
      } catch {
        /* no era JSON */
      }
    }
  }
  return null
}

const authHeaders = (): Record<string, string> => {
  const token = leerToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Nombre del usuario de la sesión (para que el saludo coincida con la cabecera)
const leerNombreSesion = (): string | null => {
  for (const store of [localStorage, sessionStorage]) {
    for (let i = 0; i < store.length; i++) {
      const raw = store.getItem(store.key(i) ?? '')
      if (!raw || raw[0] !== '{') continue
      try {
        const obj = JSON.parse(raw) as Record<string, unknown>
        const dentro = (obj.user ?? obj.usuario ?? obj) as Record<string, unknown>
        const n = dentro.nombreCompleto ?? dentro.fullName ?? dentro.name ?? dentro.nombre
        if (typeof n === 'string' && n) return n
      } catch {
        /* no era JSON */
      }
    }
  }
  return null
}

// Llamada con token. Si el servidor responde con error, lanza el mensaje que él devuelve.
const llamar = async (ruta: string, metodo: 'POST' | 'DELETE' = 'POST', cuerpo?: unknown) => {
  const res = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? `HTTP ${res.status}`)
  }
  return res.status === 204 ? null : await res.json().catch(() => null)
}

const mensajeError = (err: unknown, porDefecto: string) =>
  err instanceof Error && !err.message.startsWith('HTTP') ? err.message : porDefecto

/* ───────────────────────────── TIPOS ───────────────────────────── */
interface Usuario {
  id: number
  nombreCompleto?: string
  nombre?: string
  email: string
  rol: string
  eliminado?: boolean
}

interface Empleado {
  id?: number
  nombre: string
  cargo: string
  bloque: string
  activo: boolean
  email?: string | null
  password?: string | null
}

interface Venta {
  id: number
  fecha: string
  cliente: string
  metodoPago: 'QR' | 'EFECTIVO'
  bloque: string
  total: number
}

type Pestana = 'inicio' | 'usuarios' | 'empleados' | 'reportes'
type FiltroUsuarios = 'TODOS' | 'ACTIVOS' | 'ELIMINADOS'

/* ───────────────────────────── ÍCONOS (SVG inline) ───────────────────────────── */
const ICONS = {
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  restore: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  pdf: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  wallet:
    '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
} as const

type IconName = keyof typeof ICONS

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  )
}

const bs = (n: number) => `Bs. ${n.toFixed(2)}`
const etiquetaBloque = (b: string) => (b === 'AMBOS' ? 'Ambos bloques' : b.replace('BLOQUE_', 'Bloque '))
const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
const nombreDe = (u: Usuario) => u.nombreCompleto || u.nombre || 'Sin nombre'

const TITULOS: Record<Pestana, { titulo: string; sub: string }> = {
  inicio: { titulo: 'Inicio', sub: 'Resumen general de la cafetería' },
  usuarios: { titulo: 'Gestión de usuarios', sub: 'Rehabilita cuentas eliminadas o elimínalas de forma permanente' },
  empleados: { titulo: 'Personal y turnos', sub: 'Registra al equipo y gestiona quién está en turno' },
  reportes: { titulo: 'Reportes y ventas', sub: 'Analiza ingresos y exporta tus balances' },
}

const NAV: { id: Pestana; label: string; icon: IconName }[] = [
  { id: 'inicio', label: 'Inicio Admin', icon: 'home' },
  { id: 'usuarios', label: 'Gestionar Usuarios', icon: 'shield' },
  { id: 'empleados', label: 'Personal', icon: 'users' },
  { id: 'reportes', label: 'Reportes', icon: 'chart' },
]

export function AdminView() {
  const usuario = leerNombreSesion() ?? 'Administrador'
  const [pestana, setPestana] = useState<Pestana>('inicio')
  const [cargando, setCargando] = useState(false)
  const [errorApi, setErrorApi] = useState(false)
  const [errorAuth, setErrorAuth] = useState(false)
  const [detalleError, setDetalleError] = useState('')
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'error' } | null>(null)

  // Usuarios (cuentas de acceso)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('')
  const [filtroUsuarios, setFiltroUsuarios] = useState<FiltroUsuarios>('TODOS')

  // Empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [nombreEmp, setNombreEmp] = useState('')
  const [cargoEmp, setCargoEmp] = useState('Cajero')
  const [bloqueEmp, setBloqueEmp] = useState('BLOQUE_A')
  const [credenciales, setCredenciales] = useState<{ nombre: string; email: string; password: string } | null>(null)

  // Ventas de ejemplo (se reemplazarán por las ventas reales de los cajeros)
  const [ventas] = useState<Venta[]>([
    { id: 1, fecha: '2026-10-03 08:30', cliente: 'Carlos Mamani', metodoPago: 'QR', bloque: 'BLOQUE_A', total: 12.0 },
    { id: 2, fecha: '2026-10-03 09:15', cliente: 'Ana Flores', metodoPago: 'EFECTIVO', bloque: 'BLOQUE_B', total: 15.0 },
    { id: 3, fecha: '2026-10-03 10:00', cliente: 'David Quispe', metodoPago: 'QR', bloque: 'BLOQUE_A', total: 5.0 },
    { id: 4, fecha: '2026-10-03 11:20', cliente: 'Lucía Vargas', metodoPago: 'QR', bloque: 'BLOQUE_B', total: 22.5 },
  ])

  /* ── Toast Notificaciones ── */
  const notify = useCallback((msg: string, tipo: 'ok' | 'error' = 'ok') => setToast({ msg, tipo }), [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  /* ── Carga de datos desde Spring Boot ── */
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    const pedir = <T,>(ruta: string) =>
      fetch(`${API}${ruta}`, { headers: authHeaders() }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<T>
      })

    const [u, e] = await Promise.allSettled([pedir<Usuario[]>('/usuarios'), pedir<Empleado[]>('/empleados')])

    if (u.status === 'fulfilled' && Array.isArray(u.value)) setUsuarios(u.value)
    if (e.status === 'fulfilled' && Array.isArray(e.value)) setEmpleados(e.value)

    const resultados = [u, e]
    const fallos = resultados.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    setErrorApi(fallos.length > 0)
    setErrorAuth(fallos.some((r) => /HTTP 40[13]/.test(String(r.reason))))

    const nombresRutas = ['usuarios', 'empleados']
    const detalle = resultados.flatMap((r, i) =>
      r.status === 'rejected' ? [`${nombresRutas[i]} (${String(r.reason).replace('Error: ', '')})`] : [],
    )
    const sinToken = leerToken() ? '' : ' · No se encontró ningún token en localStorage ni en sessionStorage.'
    setDetalleError(detalle.join(', ') + sinToken)
    setCargando(false)
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  /* ── Acciones: usuarios (cuentas) ── */
  const eliminarUsuarioDefinitivo = async (user: Usuario) => {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE a ${nombreDe(user)}? Esta acción no se puede deshacer.`)) return
    try {
      await llamar(`/usuarios/${user.id}`, 'DELETE')
      setUsuarios((prev) => prev.filter((u) => u.id !== user.id))
      notify('Usuario eliminado permanentemente')
      void cargarDatos()
    } catch (err) {
      notify(mensajeError(err, 'No se pudo eliminar el usuario'), 'error')
    }
  }

  const rehabilitarUsuario = async (user: Usuario) => {
    try {
      await llamar(`/usuarios/${user.id}/rehabilitar`)
      notify(`${nombreDe(user)} fue rehabilitado`)
      void cargarDatos()
    } catch (err) {
      notify(mensajeError(err, 'No se pudo rehabilitar al usuario'), 'error')
    }
  }

  /* ── Acciones: empleados ── */
  const handleGuardarEmpleado = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const resp = (await llamar('/empleados', 'POST', {
        nombre: nombreEmp,
        cargo: cargoEmp,
        bloque: bloqueEmp,
        activo: true,
      })) as Empleado | null
      setNombreEmp('')
      if (resp?.email && resp.password) {
        setCredenciales({ nombre: resp.nombre, email: resp.email, password: resp.password })
      }
      notify('Empleado registrado')
      void cargarDatos()
    } catch (err) {
      notify(mensajeError(err, 'No se pudo registrar al empleado'), 'error')
    }
  }

  const toggleEmpleadoTurno = async (emp: Empleado) => {
    try {
      await llamar('/empleados', 'POST', { ...emp, activo: !emp.activo })
      notify(emp.activo ? `Turno finalizado: ${emp.nombre}` : `Turno iniciado: ${emp.nombre}`)
      void cargarDatos()
    } catch (err) {
      notify(mensajeError(err, 'No se pudo actualizar el turno'), 'error')
    }
  }

  // Crea la cuenta del empleado (si no tiene) o genera una contraseña nueva
  const generarAcceso = async (emp: Empleado) => {
    if (emp.id === undefined) return
    if (emp.email && !window.confirm(`¿Restablecer la contraseña de ${emp.nombre}? La anterior dejará de funcionar.`)) return
    try {
      const resp = (await llamar(`/empleados/${emp.id}/credenciales`)) as { email: string; password: string } | null
      if (resp) setCredenciales({ nombre: emp.nombre, email: resp.email, password: resp.password })
      void cargarDatos()
    } catch (err) {
      notify(mensajeError(err, 'No se pudo generar el acceso'), 'error')
    }
  }

  // Eliminación lógica: sale de Personal y su cuenta queda deshabilitada
  const eliminarEmpleado = async (emp: Empleado) => {
    if (emp.id === undefined) return
    const aviso = emp.email
      ? `¿Eliminar a ${emp.nombre} del personal? Su cuenta (${emp.email}) quedará deshabilitada. Podrás rehabilitarla o eliminarla definitivamente en Gestionar Usuarios.`
      : `¿Eliminar a ${emp.nombre} del personal? No tiene cuenta de acceso, así que no aparecerá en Gestionar Usuarios para rehabilitarlo.`
    if (!window.confirm(aviso)) return
    try {
      await llamar(`/empleados/${emp.id}`, 'DELETE')
      notify(`${emp.nombre} fue eliminado del personal`)
      void cargarDatos()
    } catch (err) {
      notify(mensajeError(err, 'No se pudo eliminar al empleado'), 'error')
    }
  }

  const copiarCredenciales = () => {
    if (!credenciales) return
    const texto = `Correo: ${credenciales.email}\nContraseña: ${credenciales.password}`
    void navigator.clipboard
      .writeText(texto)
      .then(() => notify('Datos copiados'))
      .catch(() => notify('No se pudo copiar', 'error'))
  }

  /* ── Datos derivados ── */
  const totalRecaudado = useMemo(() => ventas.reduce((a, v) => a + v.total, 0), [ventas])
  const enTurno = empleados.filter((e) => e.activo).length
  const conAcceso = empleados.filter((e) => e.email).length

  const usuariosActivos = useMemo(() => usuarios.filter((u) => !u.eliminado), [usuarios])
  const usuariosEliminados = usuarios.length - usuariosActivos.length

  const usuariosFiltrados = useMemo(() => {
    const q = busquedaUsuarios.toLowerCase()
    return usuarios.filter((u) => {
      const coincideEstado =
        filtroUsuarios === 'TODOS' || (filtroUsuarios === 'ACTIVOS' ? !u.eliminado : Boolean(u.eliminado))
      return coincideEstado && (nombreDe(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    })
  }, [usuarios, filtroUsuarios, busquedaUsuarios])

  const porBloque = useMemo(() => {
    const mapa: Record<string, number> = {}
    ventas.forEach((v) => (mapa[v.bloque] = (mapa[v.bloque] ?? 0) + v.total))
    return Object.entries(mapa)
  }, [ventas])

  const totalQR = ventas.filter((v) => v.metodoPago === 'QR').reduce((a, v) => a + v.total, 0)
  const totalEfectivo = totalRecaudado - totalQR

  /* ── Exportaciones PDF / Excel ── */
  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(168, 0, 151)
    doc.text('Cafetería UNIFRANZ - Reporte Oficial', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 14, 28)

    autoTable(doc, {
      startY: 36,
      head: [['ID', 'Fecha / Hora', 'Cliente', 'Método', 'Bloque', 'Monto (Bs)']],
      body: ventas.map((v) => [v.id, v.fecha, v.cliente, v.metodoPago, etiquetaBloque(v.bloque), v.total.toFixed(2)]),
      foot: [['', '', '', '', 'TOTAL', totalRecaudado.toFixed(2)]],
      headStyles: { fillColor: [168, 0, 151] },
      theme: 'striped',
    })
    doc.save(`Reporte_UNIFRANZ_${new Date().toISOString().slice(0, 10)}.pdf`)
    notify('PDF generado')
  }

  const exportarExcel = () => {
    const datos = ventas.map((v) => ({
      ID: v.id,
      'Fecha y Hora': v.fecha,
      Cliente: v.cliente,
      'Método de Pago': v.metodoPago,
      Bloque: etiquetaBloque(v.bloque),
      'Total (Bs)': v.total,
    }))
    // @ts-ignore
    const hoja = XLSX.utils.json_to_sheet(datos)
    // @ts-ignore
    const libro = XLSX.utils.book_new()
    // @ts-ignore
    XLSX.utils.book_append_sheet(libro, hoja, 'Ventas')
    // @ts-ignore
    XLSX.writeFile(libro, `Reporte_UNIFRANZ_${new Date().toISOString().slice(0, 10)}.xlsx`)
    notify('Excel generado')
  }

  return (
    <div className="adm">
      <style>{CSS}</style>

      {/* ── CABECERA ORIGINAL UNIFRANZ CON BOTÓN CERRAR SESIÓN ── */}
      <div className="hero-wrap">
        <RoleHome eyebrow="ADMINISTRACIÓN" title="Panel de administrador" />
      </div>

      {/* ── CUERPO: MENÚ LATERAL IZQUIERDO + CONTENIDO ── */}
      <div className="wrap shell">
        <aside className="side">
          <span className="side-heading">Navegación</span>
          <nav className="nav">
            {NAV.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${pestana === item.id ? 'active' : ''}`}
                onClick={() => setPestana(item.id)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.id === 'usuarios' && usuariosActivos.length > 0 && (
                  <span className="nav-badge soft">{usuariosActivos.length}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="content">
          {/* Barra de título + acciones */}
          <div className="bar">
            <div>
              <h2 className="bar-title">{TITULOS[pestana].titulo}</h2>
              <p className="bar-sub">{TITULOS[pestana].sub}</p>
            </div>
            <div className="bar-actions">
              <ThemeToggle />
              <button className="btn ghost" onClick={() => void cargarDatos()} title="Recargar datos">
                <span className={cargando ? 'spin' : ''} style={{ display: 'inline-flex' }}>
                  <Icon name="refresh" size={16} />
                </span>
                <span className="hide-sm">Actualizar</span>
              </button>
              {pestana === 'reportes' && (
                <>
                  <button className="btn danger" onClick={exportarPDF}>
                    <Icon name="pdf" size={16} /> <span className="hide-sm">PDF</span>
                  </button>
                  <button className="btn success" onClick={exportarExcel}>
                    <Icon name="sheet" size={16} /> <span className="hide-sm">Excel</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {errorApi && (
            <div className="banner">
              <Icon name="alert" />
              {errorAuth ? (
                <div>
                  <strong>Sesión no autorizada.</strong> El servidor rechazó algunas peticiones (401/403). Cierra sesión y vuelve a
                  iniciar para renovar tu token.
                  {detalleError && <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>Detalle: {detalleError}</div>}
                </div>
              ) : (
                <div>
                  <strong>Sin conexión completa con el servidor.</strong> No se pudo contactar a <code>localhost:8080</code>.
                </div>
              )}
              <button className="btn ghost sm" onClick={() => void cargarDatos()}>Reintentar</button>
            </div>
          )}

          {/* Métricas Superiores */}
          <section className="stats">
            <StatCard icon="wallet" label="Total recaudado" value={bs(totalRecaudado)} color="#16a34a" hint={`${ventas.length} ventas · datos de ejemplo`} />
            <StatCard icon="shield" label="Usuarios del sistema" value={String(usuariosActivos.length)} color="#a80097" hint={`${usuariosEliminados} eliminados`} />
            <StatCard icon="users" label="Personal registrado" value={String(empleados.length)} color="#2563eb" hint={`${conAcceso} con acceso al sistema`} />
            <StatCard icon="check" label="Personal en turno" value={String(enTurno)} color="#d97706" hint={`de ${empleados.length} registrados`} />
          </section>

          {/* ── 0. INICIO ── */}
          {pestana === 'inicio' && (
            <div className="fade">
              <section className="card welcome">
                <h3>¡Bienvenido al sistema, {usuario}!</h3>
                <p>Desde este panel controlas los accesos de usuarios, el personal de la cafetería y los reportes de ventas.</p>
                <div className="tiles">
                  {NAV.filter((n) => n.id !== 'inicio').map((n) => (
                    <button key={n.id} className="tile" onClick={() => setPestana(n.id)}>
                      <span className="tile-icon"><Icon name={n.icon} size={20} /></span>
                      <span className="tile-text">
                        <strong>{n.label}</strong>
                        <small>{TITULOS[n.id].sub}</small>
                      </span>
                      <Icon name="chevron" size={16} />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── 1. GESTIÓN DE USUARIOS ── */}
          {pestana === 'usuarios' && (
            <section className="card fade">
              <div className="card-head">
                <h3 className="card-title nomargin">
                  <Icon name="shield" size={18} /> Lista de Usuarios <span className="count">{usuariosFiltrados.length}</span>
                </h3>
                <div className="search">
                  <Icon name="search" size={16} />
                  <input placeholder="Buscar usuario..." value={busquedaUsuarios} onChange={(e) => setBusquedaUsuarios(e.target.value)} />
                </div>
              </div>

              <div className="pills">
                {(['TODOS', 'ACTIVOS', 'ELIMINADOS'] as FiltroUsuarios[]).map((f) => (
                  <button key={f} className={`pill ${filtroUsuarios === f ? 'active' : ''}`} onClick={() => setFiltroUsuarios(f)}>
                    {f === 'TODOS' && `Todos (${usuarios.length})`}
                    {f === 'ACTIVOS' && `Activos (${usuariosActivos.length})`}
                    {f === 'ELIMINADOS' && `Eliminados (${usuariosEliminados})`}
                  </button>
                ))}
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((user) => (
                      <tr key={user.id} className={user.eliminado ? 'eliminado' : ''}>
                        <td className="muted">#{user.id}</td>
                        <td>
                          <div className="inline-user">
                            <div className="avatar grad">{iniciales(nombreDe(user))}</div>
                            <span className="cell-main">{nombreDe(user)}</span>
                          </div>
                        </td>
                        <td className="muted">{user.email}</td>
                        <td>
                          <span className={`chip ${user.rol === 'ADMIN' ? 'violet' : 'amber'}`}>{user.rol}</span>
                        </td>
                        <td>
                          <span className={`chip ${user.eliminado ? 'red' : 'green'}`}>{user.eliminado ? 'Eliminado' : 'Activo'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="row-actions">
                            {user.eliminado && (
                              <button className="btn softgreen sm" onClick={() => void rehabilitarUsuario(user)}>
                                <Icon name="restore" size={14} /> Rehabilitar
                              </button>
                            )}
                            <button className="btn softdanger sm" onClick={() => void eliminarUsuarioDefinitivo(user)}>
                              <Icon name="trash" size={14} /> Eliminar definitivamente
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuariosFiltrados.length === 0 && (
                  <div className="empty">
                    <Icon name="inbox" size={28} />
                    <span>{cargando ? 'Cargando usuarios...' : 'No hay usuarios para mostrar'}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── 2. EMPLEADOS ── */}
          {pestana === 'empleados' && (
            <section className="split fade">
              <div className="card">
                <h3 className="card-title"><Icon name="plus" size={18} /> Registrar empleado</h3>
                <form onSubmit={handleGuardarEmpleado} className="form">
                  <label className="field">
                    <span>Nombre completo</span>
                    <input className="input" placeholder="Ej. María Rojas" value={nombreEmp} onChange={(e) => setNombreEmp(e.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Cargo</span>
                    <select className="input" value={cargoEmp} onChange={(e) => setCargoEmp(e.target.value)}>
                      <option value="Cajero">Cajero / Atención</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Bloque</span>
                    <select className="input" value={bloqueEmp} onChange={(e) => setBloqueEmp(e.target.value)}>
                      <option value="BLOQUE_A">Bloque A</option>
                      <option value="BLOQUE_B">Bloque B</option>
                    </select>
                  </label>
                  <button type="submit" className="btn primary block">Registrar empleado</button>
                  <p className="form-hint">El correo y la contraseña se generan automáticamente. Los verás una sola vez al registrar.</p>
                </form>
              </div>

              <div className="card">
                <h3 className="card-title"><Icon name="users" size={18} /> Personal <span className="count">{empleados.length}</span></h3>
                {empleados.length === 0 ? (
                  <div className="empty">
                    <Icon name="inbox" size={28} />
                    <span>{cargando ? 'Cargando personal…' : 'Aún no hay empleados registrados'}</span>
                  </div>
                ) : (
                  <div className="emp-grid">
                    {empleados.map((emp) => (
                      <div key={emp.id ?? emp.nombre} className={`emp ${emp.activo ? 'on' : ''}`}>
                        <div className="emp-top">
                          <div className="avatar grad">{iniciales(emp.nombre)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="cell-main">{emp.nombre}</div>
                            <div className="cell-sub">{emp.cargo} · {etiquetaBloque(emp.bloque)}</div>
                            <div className="cell-sub emp-mail">{emp.email ?? 'Sin acceso al sistema'}</div>
                          </div>
                        </div>
                        <div className="emp-foot">
                          <span className={`status ${emp.activo ? 'ok' : 'off'}`}><i />{emp.activo ? 'En turno' : 'Fuera'}</span>
                          <div className="row-actions">
                            <button className="btn ghost sm" onClick={() => void generarAcceso(emp)}>{emp.email ? 'Restablecer clave' : 'Crear acceso'}</button>
                            <button className="btn ghost sm" onClick={() => void toggleEmpleadoTurno(emp)}>{emp.activo ? 'Finalizar' : 'Iniciar'}</button>
                            <button className="btn softdanger sm" onClick={() => void eliminarEmpleado(emp)} aria-label={`Eliminar a ${emp.nombre}`} title="Eliminar del personal">
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── 3. REPORTES ── */}
          {pestana === 'reportes' && (
            <div className="fade">
              <div className="info-note">
                <Icon name="alert" size={16} />
                <span>Datos de ejemplo. Estos reportes se alimentarán de las ventas registradas por los cajeros.</span>
              </div>
              <section className="charts">
                <div className="card">
                  <h3 className="card-title"><Icon name="chart" size={18} /> Ventas por bloque</h3>
                  <div className="bars">
                    {porBloque.map(([bloque, monto]) => {
                      const pct = totalRecaudado ? (monto / totalRecaudado) * 100 : 0
                      return (
                        <div key={bloque} className="bar-row">
                          <div className="bar-label"><span>{etiquetaBloque(bloque)}</span><strong>{bs(monto)}</strong></div>
                          <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                          <span className="bar-pct">{pct.toFixed(0)}% del total</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="card">
                  <h3 className="card-title"><Icon name="wallet" size={18} /> Métodos de pago</h3>
                  <Donut qr={totalQR} efectivo={totalEfectivo} />
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* ── CREDENCIALES DEL EMPLEADO (se muestran una sola vez) ── */}
      {credenciales && (
        <div className="modal-overlay" onClick={() => setCredenciales(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><Icon name="shield" size={22} /></div>
            <h3>Acceso de {credenciales.nombre}</h3>
            <p className="modal-sub">
              Entrega estos datos al empleado. Guarda la contraseña ahora: <strong>no se volverá a mostrar</strong> (si se pierde,
              puedes restablecerla desde su tarjeta).
            </p>
            <div className="cred-row"><span>Correo</span><code>{credenciales.email}</code></div>
            <div className="cred-row"><span>Contraseña</span><code>{credenciales.password}</code></div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={copiarCredenciales}>Copiar datos</button>
              <button className="btn primary" onClick={() => setCredenciales(null)}>Listo</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICACIONES ── */}
      {toast && (
        <div className={`toast ${toast.tipo}`} role="status">
          <Icon name={toast.tipo === 'ok' ? 'check' : 'alert'} size={16} />
          {toast.msg}
        </div>
      )}
    </div>
  )
}

/* ───────────────────────────── SUBCOMPONENTES ───────────────────────────── */
function StatCard({ icon, label, value, hint, color }: { icon: IconName; label: string; value: string; hint: string; color: string }) {
  return (
    <div className="stat" style={{ '--c': color } as CSSProperties}>
      <div className="stat-icon"><Icon name={icon} size={20} /></div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-hint">{hint}</span>
      </div>
    </div>
  )
}

function Donut({ qr, efectivo }: { qr: number; efectivo: number }) {
  const total = qr + efectivo
  const R = 40
  const C = 2 * Math.PI * R
  const pctQR = total ? qr / total : 0
  const pctEf = total ? efectivo / total : 0
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width="150" height="150" role="img" aria-label="Distribución de métodos de pago">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#eef0f5" strokeWidth="12" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="#a80097" strokeWidth="12" strokeDasharray={`${pctQR * C} ${C}`} transform="rotate(-90 50 50)" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${pctEf * C} ${C}`} strokeDashoffset={-pctQR * C} transform="rotate(-90 50 50)" />
        <text x="50" y="48" textAnchor="middle" fill="#1f2430" fontSize="11" fontWeight="700">{total.toFixed(0)}</text>
        <text x="50" y="60" textAnchor="middle" fill="#6b7280" fontSize="6">Bs. total</text>
      </svg>
      <ul className="legend">
        <li><i style={{ background: '#a80097' }} /><span>QR</span><strong>{bs(qr)}</strong><em>{(pctQR * 100).toFixed(0)}%</em></li>
        <li><i style={{ background: '#f59e0b' }} /><span>Efectivo</span><strong>{bs(efectivo)}</strong><em>{(pctEf * 100).toFixed(0)}%</em></li>
      </ul>
    </div>
  )
}

/* ───────────────────────────── ESTILOS CSS ───────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.adm, .adm * { box-sizing: border-box; }
.adm {
  --brand: #a80097; --brand-2: #8a00d4; --bg: #f6f7fb; --card: #ffffff;
  --border: #e8eaf1; --text: #1f2430; --muted: #6b7280; --ok: #16a34a; --bad: #e11d48;
  min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 14px;
}
.adm button, .adm input, .adm select { font-family: inherit; }
.adm h1, .adm h2, .adm h3, .adm p { margin: 0; }
.adm code { background: rgba(0,0,0,0.06); padding: 1px 6px; border-radius: 6px; font-size: 12px; }
.adm ::-webkit-scrollbar { width: 8px; height: 8px; }
.adm ::-webkit-scrollbar-thumb { background: #d4d7e0; border-radius: 8px; }
.adm :focus-visible { outline: 2px solid var(--brand-2); outline-offset: 2px; }
.wrap { width: 100%; max-width: 1440px; margin: 0 auto; padding: 0 32px; }

/* ── Cabecera RoleHome: evita que ocupe toda la pantalla y deje un hueco en blanco ── */
.hero-wrap { height: auto; min-height: 0; }
.hero-wrap > *, .hero-wrap > * > * { min-height: 0 !important; }
.hero-wrap > * { height: auto !important; }

/* ── Cuerpo: menú lateral + contenido ── */
.shell { display: grid; grid-template-columns: 270px minmax(0, 1fr); gap: 26px; align-items: start; margin-top: 28px; padding-bottom: 56px; }
.side { position: sticky; top: 20px; background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 18px 14px; box-shadow: 0 18px 40px -26px rgba(30,20,60,0.35); }
.side-heading { display: block; padding: 4px 10px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9aa1b2; }
.nav { display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px;
  border: 0; border-radius: 12px; background: transparent; cursor: pointer;
  color: #3b4252; font-size: 14px; font-weight: 500; text-align: left;
  transition: background .18s, color .18s, box-shadow .18s;
}
.nav-item:hover { background: #f3eefb; color: var(--brand-2); }
.nav-item.active { background: var(--brand-2); color: #fff; font-weight: 600; box-shadow: 0 12px 24px -12px rgba(138,0,212,0.8); }
.nav-badge { margin-left: auto; min-width: 22px; height: 22px; padding: 0 7px; border-radius: 11px; display: grid; place-items: center; font-size: 11px; font-weight: 700; background: #fde68a; color: #7a4a00; }
.nav-badge.soft { background: #eceef4; color: #4b5263; }
.nav-item.active .nav-badge { background: rgba(255,255,255,0.25); color: #fff; }

.content { min-width: 0; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.bar-title { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
.bar-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }
.bar-actions { display: flex; gap: 8px; }

/* ── Botones ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px; border: 1px solid transparent; border-radius: 10px;
  font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
  transition: transform .15s, box-shadow .2s, background .2s, color .2s, border-color .2s;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn.sm { padding: 7px 12px; font-size: 12px; border-radius: 9px; }
.btn.block { width: 100%; padding: 12px; }
.btn.primary { background: var(--brand-2); box-shadow: 0 8px 18px -10px rgba(138,0,212,0.9); }
.btn.success { background: #16a34a; box-shadow: 0 8px 18px -10px rgba(22,163,74,0.8); }
.btn.danger { background: #e11d48; box-shadow: 0 8px 18px -10px rgba(225,29,72,0.8); }
.btn.ghost { background: #fff; border-color: var(--border); color: var(--text); }
.btn.ghost:hover { background: #f5f6fa; }
.btn.softdanger { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
.btn.softdanger:hover { background: #e11d48; border-color: #e11d48; color: #fff; }
.btn.softgreen { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
.btn.softgreen:hover { background: #16a34a; border-color: #16a34a; color: #fff; }
.row-actions { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

/* ── Avisos ── */
.banner { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 20px; border-radius: 14px; background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; font-size: 13px; }
.banner > div { flex: 1; }
.info-note { display: flex; align-items: center; gap: 10px; padding: 12px 14px; margin-bottom: 16px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; color: #92600a; font-size: 13px; }

/* ── Métricas ── */
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 22px; }
.stat { display: flex; align-items: center; gap: 14px; padding: 18px; border-radius: 16px; background: var(--card); border: 1px solid var(--border); transition: transform .2s, box-shadow .2s; }
.stat:hover { transform: translateY(-3px); box-shadow: 0 16px 30px -20px rgba(30,20,60,0.4); }
.stat-icon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; color: var(--c); background: color-mix(in srgb, var(--c) 12%, #fff); }
.stat-label { display: block; font-size: 12px; color: var(--muted); font-weight: 500; }
.stat-value { display: block; font-size: 21px; font-weight: 700; letter-spacing: -0.02em; margin: 2px 0; }
.stat-hint { display: block; font-size: 11px; color: var(--muted); }

/* ── Cards ── */
.card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 22px; min-width: 0; box-shadow: 0 10px 30px -26px rgba(30,20,60,0.5); }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.card-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; margin-bottom: 18px; }
.card-title.nomargin { margin-bottom: 0; }
.card-title svg { color: var(--brand); }
.count { font-size: 12px; font-weight: 700; padding: 2px 9px; border-radius: 20px; background: #f1f2f7; color: var(--muted); }
.split { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 22px; align-items: start; }

/* ── Inicio ── */
.welcome { position: relative; overflow: hidden; padding-left: 28px; }
.welcome::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(180deg, var(--brand), var(--brand-2)); }
.welcome h3 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
.welcome > p { color: var(--muted); margin: 8px 0 22px; line-height: 1.55; max-width: 720px; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
.tile { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 14px; border: 1px solid var(--border); background: #fbfbfe; cursor: pointer; text-align: left; color: var(--text); transition: transform .18s, border-color .2s, box-shadow .2s; }
.tile:hover { transform: translateY(-2px); border-color: #d9b8f4; box-shadow: 0 14px 26px -20px rgba(138,0,212,0.7); }
.tile-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: #f3e8fc; color: var(--brand-2); flex-shrink: 0; }
.tile-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tile-text strong { font-size: 14px; }
.tile-text small { color: var(--muted); font-size: 12px; line-height: 1.35; }
.tile > svg:last-child { color: #b0b6c4; }

/* ── Avatares ── */
.avatar { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-size: 12px; font-weight: 700; color: #fff; background: #94a3b8; }
.avatar.grad { background: linear-gradient(135deg, var(--brand), var(--brand-2)); }

/* ── Formularios ── */
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; color: var(--muted); }
.input { width: 100%; padding: 11px 13px; border-radius: 10px; font-size: 14px; color: var(--text); background: #fff; border: 1px solid #dcdfe8; transition: border-color .2s, box-shadow .2s; }
.input::placeholder { color: #a3a9b9; font-weight: 400; }
.input:focus { outline: none; border-color: var(--brand-2); box-shadow: 0 0 0 4px rgba(138,0,212,0.12); }
.search { display: flex; align-items: center; gap: 8px; padding: 0 12px; border-radius: 10px; border: 1px solid #dcdfe8; background: #fff; color: var(--muted); transition: border-color .2s, box-shadow .2s; }
.search:focus-within { border-color: var(--brand-2); box-shadow: 0 0 0 4px rgba(138,0,212,0.12); }
.search input { background: transparent; border: 0; outline: 0; color: var(--text); padding: 10px 0; font-size: 13px; width: 180px; }
.pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.pill { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: #fff; color: var(--muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .18s; }
.pill:hover { color: var(--brand-2); border-color: #d9b8f4; }
.pill.active { background: #f3e8fc; border-color: #d9b8f4; color: var(--brand-2); }

/* ── Tablas ── */
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; text-align: left; }
.table th { padding: 10px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #8a91a3; border-bottom: 1px solid var(--border); white-space: nowrap; }
.table td { padding: 14px 12px; border-bottom: 1px solid #f0f1f6; vertical-align: middle; }
.table tbody tr { transition: background .15s; }
.table tbody tr:hover { background: #faf7fd; }
.table tbody tr:last-child td { border-bottom: 0; }
.table tr.eliminado td:not(:last-child) { opacity: 0.55; }
.muted { color: var(--muted); white-space: nowrap; }
.cell-main { font-weight: 600; }
.cell-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.inline-user { display: flex; align-items: center; gap: 12px; }
.chip { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; background: #f1f2f7; color: #4b5263; white-space: nowrap; }
.chip.violet { background: #f9e5f6; color: var(--brand); }
.chip.amber { background: #fef3c7; color: #92600a; }
.chip.green { background: #dcfce7; color: #166534; }
.chip.red { background: #ffe4e6; color: #be123c; }

/* ── Empleados ── */
.emp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.emp { padding: 16px; border-radius: 14px; background: #fbfbfe; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; transition: transform .18s, border-color .2s; }
.emp:hover { transform: translateY(-2px); }
.emp.on { border-color: #a7e3bd; background: #f6fdf9; }
.emp-top { display: flex; align-items: center; gap: 12px; }
.emp-top .avatar { width: 42px; height: 42px; font-size: 14px; }
.emp-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.emp-mail { word-break: break-all; }
.status { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; }
.status i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status.ok { color: var(--ok); }
.status.ok i { box-shadow: 0 0 0 4px rgba(22,163,74,0.16); }
.status.off { color: var(--bad); }
.form-hint { font-size: 12px; color: var(--muted); line-height: 1.45; }

/* ── Gráficos ── */
.charts { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
.bars { display: flex; flex-direction: column; gap: 20px; }
.bar-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.bar-track { height: 10px; border-radius: 6px; background: #eef0f5; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--brand), var(--brand-2)); transition: width .6s cubic-bezier(.2,.8,.2,1); }
.bar-pct { display: block; font-size: 11px; color: var(--muted); margin-top: 6px; }
.donut-wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; justify-content: center; }
.legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; flex: 1; min-width: 170px; font-size: 13px; }
.legend li { display: grid; grid-template-columns: 12px 1fr auto auto; align-items: center; gap: 10px; }
.legend i { width: 12px; height: 12px; border-radius: 4px; }
.legend em { font-style: normal; color: var(--muted); font-size: 12px; min-width: 34px; text-align: right; }

/* ── Ventana de credenciales ── */
.modal-overlay { position: fixed; inset: 0; z-index: 70; display: grid; place-items: center; padding: 16px; background: rgba(20, 10, 40, 0.55); backdrop-filter: blur(3px); animation: fadeUp .2s ease both; }
.modal { width: 100%; max-width: 440px; background: #fff; border-radius: 20px; padding: 26px; box-shadow: 0 30px 70px -20px rgba(0,0,0,0.5); }
.modal-icon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; color: var(--brand-2); background: #f3e8fc; margin-bottom: 14px; }
.modal h3 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.modal-sub { color: var(--muted); font-size: 13px; line-height: 1.5; margin: 8px 0 18px; }
.cred-row { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; margin-bottom: 10px; border-radius: 12px; background: #faf7fd; border: 1px solid #eadcf7; }
.cred-row span { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #8a91a3; }
.cred-row code { font-size: 15px; font-weight: 600; background: transparent; padding: 0; user-select: all; word-break: break-all; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

/* ── Vacíos / toast / animaciones ── */
.empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 0; color: var(--muted); font-size: 13px; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 80; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #fff; box-shadow: 0 18px 40px -14px rgba(0,0,0,0.5); animation: slideIn .3s cubic-bezier(.2,.8,.2,1); max-width: min(480px, calc(100vw - 32px)); }
.toast.ok { background: #16a34a; }
.toast.error { background: #e11d48; }
.fade { animation: fadeUp .35s ease both; }
.spin { animation: spin 0.9s linear infinite; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes slideIn { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .adm * { animation: none !important; transition: none !important; } }

/* ── Responsive ── */
@media (max-width: 1280px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .split { grid-template-columns: 1fr; }
  .form { max-width: 520px; }
}
@media (max-width: 1024px) {
  .shell { grid-template-columns: 1fr; margin-top: 20px; }
  .side { position: static; padding: 12px; }
  .side-heading { display: none; }
  .nav { flex-direction: row; overflow-x: auto; padding-bottom: 2px; }
  .nav-item { width: auto; white-space: nowrap; flex-shrink: 0; }
<<<<<<< HEAD
  .kanban { grid-template-columns: 1fr; }
  .col { min-height: 0; }
=======
>>>>>>> 05381ec9fa7a2be9f883219c4182df5cb9263c7e
  .charts { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .wrap { padding: 0 16px; }
  .hide-sm { display: none; }
  .btn { padding: 10px 12px; }
  .stats { grid-template-columns: 1fr; }
  .search input { width: 120px; }
  .toast { left: 16px; right: 16px; bottom: 16px; max-width: none; }
}
`
