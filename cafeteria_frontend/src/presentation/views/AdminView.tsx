import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { RoleHome } from '../components/RoleHome/RoleHome'
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

/* ───────────────────────────── TIPOS ───────────────────────────── */
interface Usuario {
  id: number
  nombreCompleto?: string
  nombre?: string
  email: string
  rol: string
}

interface Producto {
  id?: number
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  bloque: string
  disponible: boolean
}

interface Empleado {
  id?: number
  nombre: string
  cargo: string
  bloque: string
  activo: boolean
}

type EstadoPedido = 'PENDIENTE' | 'PREPARANDO' | 'LISTO'

interface Pedido {
  id: number
  cliente: string
  platillo: string
  bloque: string
  estado: EstadoPedido
  total: number
}

interface Venta {
  id: number
  fecha: string
  cliente: string
  metodoPago: 'QR' | 'EFECTIVO'
  bloque: string
  total: number
}

type Pestana = 'inicio' | 'usuarios' | 'pedidos' | 'menu' | 'empleados' | 'reportes'

/* ───────────────────────────── ÍCONOS (SVG inline) ───────────────────────────── */
const ICONS = {
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  orders:
    '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  menu: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  pdf: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  wallet:
    '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  receipt:
    '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .67V2l-1 .67-3-2-3 2-3-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
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

/* ───────────────────────────── UTILIDADES ───────────────────────────── */
const bs = (n: number) => `Bs. ${n.toFixed(2)}`
const etiquetaBloque = (b: string) => (b === 'AMBOS' ? 'Ambos bloques' : b.replace('BLOQUE_', 'Bloque '))
const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

const COLUMNAS: { estado: EstadoPedido; titulo: string; color: string; icono: IconName }[] = [
  { estado: 'PENDIENTE', titulo: 'Pendientes', color: '#e11d48', icono: 'clock' },
  { estado: 'PREPARANDO', titulo: 'En preparación', color: '#d97706', icono: 'flame' },
  { estado: 'LISTO', titulo: 'Listos para retirar', color: '#16a34a', icono: 'check' },
]

const TITULOS: Record<Pestana, { titulo: string; sub: string }> = {
  inicio: { titulo: 'Inicio', sub: 'Resumen general de la cafetería' },
  usuarios: { titulo: 'Gestión de usuarios', sub: 'Administra cuentas, roles y accesos del sistema' },
  pedidos: { titulo: 'Monitor de pedidos', sub: 'Arrastra las tarjetas entre columnas para cambiar su estado' },
  menu: { titulo: 'Menú y platillos', sub: 'Publica platillos y controla su disponibilidad' },
  empleados: { titulo: 'Personal y turnos', sub: 'Registra al equipo y gestiona quién está en turno' },
  reportes: { titulo: 'Reportes y ventas', sub: 'Analiza ingresos y exporta tus balances' },
}

const NAV: { id: Pestana; label: string; icon: IconName }[] = [
  { id: 'inicio', label: 'Inicio Admin', icon: 'home' },
  { id: 'usuarios', label: 'Gestionar Usuarios', icon: 'shield' },
  { id: 'pedidos', label: 'Monitor de pedidos', icon: 'orders' },
  { id: 'menu', label: 'Menú y platillos', icon: 'menu' },
  { id: 'empleados', label: 'Personal', icon: 'users' },
  { id: 'reportes', label: 'Reportes', icon: 'chart' },
]

/* ───────────────────────────── COMPONENTE PRINCIPAL ───────────────────────────── */
export function AdminView() {
  const usuario = 'Victor Apaza'
  const [pestana, setPestana] = useState<Pestana>('inicio')
  const [cargando, setCargando] = useState(false)
  const [errorApi, setErrorApi] = useState(false)
  const [errorAuth, setErrorAuth] = useState(false)
  const [detalleError, setDetalleError] = useState('')
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'error' } | null>(null)

  // Usuarios (Backend Spring Boot)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('')

  // Productos
  const [productos, setProductos] = useState<Producto[]>([])
  const [nombreProd, setNombreProd] = useState('')
  const [descProd, setDescProd] = useState('')
  const [precioProd, setPrecioProd] = useState('')
  const [catProd, setCatProd] = useState('Almuerzo')
  const [bloqueProd, setBloqueProd] = useState('BLOQUE_A')
  const [busquedaMenu, setBusquedaMenu] = useState('')
  const [catFiltro, setCatFiltro] = useState('TODAS')

  // Empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [nombreEmp, setNombreEmp] = useState('')
  const [cargoEmp, setCargoEmp] = useState('Cajero')
  const [bloqueEmp, setBloqueEmp] = useState('BLOQUE_A')

  // Pedidos (Kanban)
  const [pedidos, setPedidos] = useState<Pedido[]>([
    { id: 101, cliente: 'Carlos Mamani', platillo: 'Silpancho', bloque: 'BLOQUE_A', estado: 'PENDIENTE', total: 12.0 },
    { id: 102, cliente: 'Ana Flores', platillo: 'Sopa de Maní + Bebida', bloque: 'BLOQUE_B', estado: 'PREPARANDO', total: 15.0 },
    { id: 103, cliente: 'David Quispe', platillo: 'Empanada de Queso', bloque: 'BLOQUE_A', estado: 'LISTO', total: 5.0 },
  ])
  const [arrastrando, setArrastrando] = useState<number | null>(null)
  const [columnaSobre, setColumnaSobre] = useState<EstadoPedido | null>(null)

  // Ventas de prueba
  const [ventas] = useState<Venta[]>([
    { id: 1, fecha: '2026-10-03 08:30', cliente: 'Carlos Mamani', metodoPago: 'QR', bloque: 'BLOQUE_A', total: 12.0 },
    { id: 2, fecha: '2026-10-03 09:15', cliente: 'Ana Flores', metodoPago: 'EFECTIVO', bloque: 'BLOQUE_B', total: 15.0 },
    { id: 3, fecha: '2026-10-03 10:00', cliente: 'David Quispe', metodoPago: 'QR', bloque: 'BLOQUE_A', total: 5.0 },
    { id: 4, fecha: '2026-10-03 11:20', cliente: 'Lucía Vargas', metodoPago: 'QR', bloque: 'BLOQUE_B', total: 22.5 },
  ])
  const [busquedaVentas, setBusquedaVentas] = useState('')
  const [filtroBloque, setFiltroBloque] = useState('TODOS')
  const [filtroMetodo, setFiltroMetodo] = useState('TODOS')

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

    const [u, p, e] = await Promise.allSettled([
      pedir<Usuario[]>('/usuarios'),
      pedir<Producto[]>('/productos'),
      pedir<Empleado[]>('/empleados'),
    ])

    if (u.status === 'fulfilled' && Array.isArray(u.value)) setUsuarios(u.value)
    if (p.status === 'fulfilled') setProductos(p.value)
    if (e.status === 'fulfilled') setEmpleados(e.value)

    const fallos = [u, p, e].filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    setErrorApi(fallos.length > 0)
    setErrorAuth(fallos.some((r) => /HTTP 40[13]/.test(String(r.reason))))

    const nombresRutas = ['usuarios', 'productos', 'empleados']
    const detalle = [u, p, e].flatMap((r, i) =>
      r.status === 'rejected' ? [`${nombresRutas[i]} (${String(r.reason).replace('Error: ', '')})`] : [],
    )
    const sinToken = leerToken() ? '' : ' · No se encontró ningún token en localStorage ni en sessionStorage.'
    setDetalleError(detalle.join(', ') + sinToken)
    setCargando(false)
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const enviar = async (ruta: string, cuerpo: unknown, metodo = 'POST') => {
    const res = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(cuerpo),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  }

  /* ── Eliminar usuario ── */
  const handleDeleteUsuario = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE', headers: authHeaders() })
        if (!res.ok) throw new Error()
        setUsuarios((prev) => prev.filter((u) => u.id !== id))
        notify('Usuario eliminado correctamente')
      } catch {
        notify('No se pudo eliminar el usuario', 'error')
      }
    }
  }

  /* ── Acciones: productos ── */
  const handleGuardarProducto = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await enviar('/productos', {
        nombre: nombreProd,
        descripcion: descProd,
        precio: parseFloat(precioProd),
        categoria: catProd,
        bloque: bloqueProd,
        disponible: true,
      })
      setNombreProd('')
      setDescProd('')
      setPrecioProd('')
      notify('Platillo publicado correctamente')
      void cargarDatos()
    } catch {
      notify('No se pudo guardar el platillo', 'error')
    }
  }

  const toggleDisponible = async (prod: Producto) => {
    try {
      await enviar('/productos', { ...prod, disponible: !prod.disponible })
      notify(prod.disponible ? `${prod.nombre} marcado como agotado` : `${prod.nombre} disponible`)
      void cargarDatos()
    } catch {
      notify('No se pudo actualizar el platillo', 'error')
    }
  }

  /* ── Acciones: empleados ── */
  const handleGuardarEmpleado = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await enviar('/empleados', { nombre: nombreEmp, cargo: cargoEmp, bloque: bloqueEmp, activo: true })
      setNombreEmp('')
      notify('Empleado registrado')
      void cargarDatos()
    } catch {
      notify('No se pudo registrar al empleado', 'error')
    }
  }

  const toggleEmpleadoTurno = async (emp: Empleado) => {
    try {
      await enviar('/empleados', { ...emp, activo: !emp.activo })
      notify(emp.activo ? `Turno finalizado: ${emp.nombre}` : `Turno iniciado: ${emp.nombre}`)
      void cargarDatos()
    } catch {
      notify('No se pudo actualizar el turno', 'error')
    }
  }

  /* ── Datos derivados ── */
  const totalRecaudado = useMemo(() => ventas.reduce((a, v) => a + v.total, 0), [ventas])
  const ticketPromedio = ventas.length ? totalRecaudado / ventas.length : 0
  const pedidosActivos = pedidos.filter((p) => p.estado !== 'LISTO').length
  const pendientes = pedidos.filter((p) => p.estado === 'PENDIENTE').length
  const enTurno = empleados.filter((e) => e.activo).length

  const usuariosFiltrados = useMemo(
    () => usuarios.filter((u) => (u.nombreCompleto || u.nombre || '').toLowerCase().includes(busquedaUsuarios.toLowerCase()) || u.email.toLowerCase().includes(busquedaUsuarios.toLowerCase())),
    [usuarios, busquedaUsuarios]
  )

  const productosFiltrados = useMemo(
    () =>
      productos.filter(
        (p) =>
          (catFiltro === 'TODAS' || p.categoria === catFiltro) &&
          p.nombre.toLowerCase().includes(busquedaMenu.toLowerCase()),
      ),
    [productos, catFiltro, busquedaMenu],
  )

  const ventasFiltradas = useMemo(
    () =>
      ventas.filter(
        (v) =>
          (filtroBloque === 'TODOS' || v.bloque === filtroBloque) &&
          (filtroMetodo === 'TODOS' || v.metodoPago === filtroMetodo) &&
          v.cliente.toLowerCase().includes(busquedaVentas.toLowerCase()),
      ),
    [ventas, filtroBloque, filtroMetodo, busquedaVentas],
  )

  const totalFiltrado = ventasFiltradas.reduce((a, v) => a + v.total, 0)
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
      body: ventasFiltradas.map((v) => [v.id, v.fecha, v.cliente, v.metodoPago, etiquetaBloque(v.bloque), v.total.toFixed(2)]),
      foot: [['', '', '', '', 'TOTAL', totalFiltrado.toFixed(2)]],
      headStyles: { fillColor: [168, 0, 151] },
      theme: 'striped',
    })
    doc.save(`Reporte_UNIFRANZ_${new Date().toISOString().slice(0, 10)}.pdf`)
    notify('PDF generado')
  }

  const exportarExcel = () => {
    const datos = ventasFiltradas.map((v) => ({
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
      <RoleHome eyebrow="ADMINISTRACIÓN" title="Panel de administrador" />

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
                {item.id === 'usuarios' && usuarios.length > 0 && <span className="nav-badge soft">{usuarios.length}</span>}
                {item.id === 'pedidos' && pedidosActivos > 0 && <span className="nav-badge">{pedidosActivos}</span>}
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
            <StatCard icon="wallet" label="Total recaudado" value={bs(totalRecaudado)} color="#16a34a" hint={`${ventas.length} ventas`} />
            <StatCard icon="shield" label="Usuarios del sistema" value={String(usuarios.length)} color="#a80097" hint="Registrados en BD" />
            <StatCard icon="flame" label="Pedidos activos" value={String(pedidosActivos)} color="#d97706" hint={`${pendientes} pendientes`} />
            <StatCard icon="users" label="Personal en turno" value={String(enTurno)} color="#2563eb" hint={`de ${empleados.length} total`} />
          </section>

          {/* ── 0. INICIO ── */}
          {pestana === 'inicio' && (
            <div className="fade">
              <section className="card welcome">
                <h3>¡Bienvenido al sistema, {usuario}!</h3>
                <p>Desde este panel izquierdo controlas los accesos de usuarios, pedidos en vivo, menú y reportes de la cafetería.</p>
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

              <div className="table-wrap">
                <table className="table">
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
                    {usuariosFiltrados.map((user) => (
                      <tr key={user.id}>
                        <td className="muted">#{user.id}</td>
                        <td>
                          <div className="inline-user">
                            <div className="avatar grad">{iniciales(user.nombreCompleto || user.nombre || 'U')}</div>
                            <span className="cell-main">{user.nombreCompleto || user.nombre || 'Sin nombre'}</span>
                          </div>
                        </td>
                        <td className="muted">{user.email}</td>
                        <td>
                          <span className={`chip ${user.rol === 'ADMIN' ? 'violet' : 'amber'}`}>{user.rol}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => void handleDeleteUsuario(user.id)}
                            className="btn softdanger sm"
                          >
                            <Icon name="trash" size={14} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuariosFiltrados.length === 0 && (
                  <div className="empty">
                    <Icon name="inbox" size={28} />
                    <span>{cargando ? 'Cargando usuarios...' : 'No hay usuarios registrados en la base de datos'}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── 2. PEDIDOS (KANBAN) ── */}
          {pestana === 'pedidos' && (
            <section className="kanban fade">
              {COLUMNAS.map((col) => {
                const lista = pedidos.filter((p) => p.estado === col.estado)
                return (
                  <div
                    key={col.estado}
                    className={`col ${columnaSobre === col.estado ? 'over' : ''}`}
                    style={{ '--c': col.color } as CSSProperties}
                    onDragOver={(e) => { e.preventDefault(); setColumnaSobre(col.estado) }}
                    onDragLeave={() => setColumnaSobre(null)}
                    onDrop={() => {
                      if (arrastrando !== null) {
                        setPedidos((prev) => prev.map((p) => (p.id === arrastrando ? { ...p, estado: col.estado } : p)))
                      }
                      setArrastrando(null)
                      setColumnaSobre(null)
                    }}
                  >
                    <div className="col-head">
                      <span className="col-dot"><Icon name={col.icono} size={14} /></span>
                      <span className="col-title">{col.titulo}</span>
                      <span className="col-count">{lista.length}</span>
                    </div>
                    <div className="col-body">
                      {lista.length === 0 && <div className="empty sm"><Icon name="inbox" size={22} /><span>Sin pedidos</span></div>}
                      {lista.map((p) => (
                        <article
                          key={p.id}
                          className={`pedido ${arrastrando === p.id ? 'dragging' : ''}`}
                          draggable
                          onDragStart={() => setArrastrando(p.id)}
                          onDragEnd={() => { setArrastrando(null); setColumnaSobre(null) }}
                        >
                          <div className="pedido-top">
                            <div className="avatar sm">{iniciales(p.cliente)}</div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="pedido-cliente">{p.cliente}</div>
                              <div className="pedido-id">Pedido #{p.id}</div>
                            </div>
                            <span className="chip">{etiquetaBloque(p.bloque)}</span>
                          </div>
                          <p className="pedido-platillo">{p.platillo}</p>
                          <div className="pedido-foot">
                            <strong>{bs(p.total)}</strong>
                            {p.estado === 'PENDIENTE' && (
                              <button className="btn primary sm" onClick={() => setPedidos((prev) => prev.map((item) => item.id === p.id ? { ...item, estado: 'PREPARANDO' } : item))}>Preparar</button>
                            )}
                            {p.estado === 'PREPARANDO' && (
                              <button className="btn success sm" onClick={() => setPedidos((prev) => prev.map((item) => item.id === p.id ? { ...item, estado: 'LISTO' } : item))}>Listos</button>
                            )}
                            {p.estado === 'LISTO' && (
                              <button className="btn ghost sm" onClick={() => setPedidos((prev) => prev.filter((item) => item.id !== p.id))}>
                                <Icon name="check" size={14} /> Entregado
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {/* ── 3. MENÚ ── */}
          {pestana === 'menu' && (
            <section className="split fade">
              <div className="card">
                <h3 className="card-title"><Icon name="plus" size={18} /> Publicar platillo</h3>
                <form onSubmit={handleGuardarProducto} className="form">
                  <label className="field">
                    <span>Nombre</span>
                    <input className="input" placeholder="Ej. Pique macho" value={nombreProd} onChange={(e) => setNombreProd(e.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Descripción</span>
                    <input className="input" placeholder="Ingredientes" value={descProd} onChange={(e) => setDescProd(e.target.value)} />
                  </label>
                  <div className="row2">
                    <label className="field">
                      <span>Precio (Bs)</span>
                      <input className="input" type="number" step="0.5" min="0" placeholder="0.00" value={precioProd} onChange={(e) => setPrecioProd(e.target.value)} required />
                    </label>
                    <label className="field">
                      <span>Categoría</span>
                      <select className="input" value={catProd} onChange={(e) => setCatProd(e.target.value)}>
                        <option value="Almuerzo">Almuerzo</option>
                        <option value="Bebida">Bebida</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    <span>Disponible en</span>
                    <select className="input" value={bloqueProd} onChange={(e) => setBloqueProd(e.target.value)}>
                      <option value="BLOQUE_A">Bloque A</option>
                      <option value="BLOQUE_B">Bloque B</option>
                      <option value="AMBOS">Ambos bloques</option>
                    </select>
                  </label>
                  <button type="submit" className="btn primary block">Guardar platillo</button>
                </form>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3 className="card-title nomargin"><Icon name="menu" size={18} /> Menú <span className="count">{productosFiltrados.length}</span></h3>
                  <div className="search">
                    <Icon name="search" size={16} />
                    <input placeholder="Buscar platillo…" value={busquedaMenu} onChange={(e) => setBusquedaMenu(e.target.value)} />
                  </div>
                </div>
                <div className="pills">
                  {['TODAS', 'Almuerzo', 'Bebida', 'Snack'].map((c) => (
                    <button key={c} className={`pill ${catFiltro === c ? 'active' : ''}`} onClick={() => setCatFiltro(c)}>{c === 'TODAS' ? 'Todas' : c}</button>
                  ))}
                </div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Platillo</th>
                        <th>Precio</th>
                        <th style={{ textAlign: 'right' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.map((prod) => (
                        <tr key={prod.id ?? prod.nombre}>
                          <td>
                            <div className="cell-main">{prod.nombre}</div>
                            <div className="cell-sub">{prod.categoria} · {etiquetaBloque(prod.bloque)}</div>
                          </td>
                          <td className="num">{bs(prod.precio)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <Switch checked={prod.disponible} onChange={() => void toggleDisponible(prod)} label={prod.disponible ? 'Disponible' : 'Agotado'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {productosFiltrados.length === 0 && <div className="empty"><Icon name="inbox" size={28} /><span>No hay platillos</span></div>}
                </div>
              </div>
            </section>
          )}

          {/* ── 4. EMPLEADOS ── */}
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
                      <option value="Cocinero">Cocinero</option>
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
                          </div>
                        </div>
                        <div className="emp-foot">
                          <span className={`status ${emp.activo ? 'ok' : 'off'}`}><i />{emp.activo ? 'En turno' : 'Fuera'}</span>
                          <button className="btn ghost sm" onClick={() => void toggleEmpleadoTurno(emp)}>{emp.activo ? 'Finalizar' : 'Iniciar'}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── 5. REPORTES ── */}
          {pestana === 'reportes' && (
            <div className="fade">
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

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={`switch ${checked ? 'on' : ''}`} onClick={onChange}>
      <span className="knob" />
      <span className="switch-text">{label}</span>
    </button>
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

/* ── Aviso API ── */
.banner { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 20px; border-radius: 14px; background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; font-size: 13px; }
.banner > div { flex: 1; }

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
.avatar.sm { width: 30px; height: 30px; font-size: 10px; background: #f3e8fc; color: var(--brand-2); }

/* ── Formularios ── */
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; color: var(--muted); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
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
.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.muted { color: var(--muted); white-space: nowrap; }
.cell-main { font-weight: 600; }
.cell-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.inline-user { display: flex; align-items: center; gap: 12px; }
.chip { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; background: #f1f2f7; color: #4b5263; white-space: nowrap; }
.chip.violet { background: #f9e5f6; color: var(--brand); }
.chip.amber { background: #fef3c7; color: #92600a; }

/* ── Switch ── */
.switch { display: inline-flex; align-items: center; gap: 10px; background: none; border: 0; cursor: pointer; color: var(--muted); font-size: 12px; font-weight: 600; padding: 0; }
.switch .knob { width: 38px; height: 22px; border-radius: 12px; background: #d4d8e2; position: relative; transition: background .2s; flex-shrink: 0; }
.switch .knob::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 2px 5px rgba(0,0,0,.25); }
.switch.on .knob { background: var(--ok); }
.switch.on .knob::after { transform: translateX(16px); }
.switch.on { color: var(--ok); }
.switch-text { min-width: 66px; text-align: left; }

/* ── Kanban ── */
.kanban { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: start; }
.col { background: #eef0f6; border: 1px solid var(--border); border-radius: 18px; padding: 14px; min-height: 420px; transition: border-color .2s, background .2s, box-shadow .2s; }
.col.over { border-color: var(--c); background: color-mix(in srgb, var(--c) 8%, #fff); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 14%, transparent); }
.col-head { display: flex; align-items: center; gap: 10px; padding: 4px 4px 14px; border-bottom: 2px solid color-mix(in srgb, var(--c) 60%, transparent); }
.col-dot { width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); }
.col-title { font-weight: 700; font-size: 14px; flex: 1; }
.col-count { min-width: 24px; height: 24px; padding: 0 8px; display: grid; place-items: center; border-radius: 12px; font-size: 12px; font-weight: 700; color: var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); }
.col-body { display: flex; flex-direction: column; gap: 12px; padding-top: 12px; }
.pedido { padding: 14px; border-radius: 14px; background: #fff; border: 1px solid var(--border); border-left: 4px solid var(--c); cursor: grab; box-shadow: 0 6px 16px -14px rgba(30,20,60,0.5); transition: transform .18s, box-shadow .2s, opacity .2s; }
.pedido:hover { transform: translateY(-2px); box-shadow: 0 16px 28px -18px rgba(30,20,60,0.55); }
.pedido:active { cursor: grabbing; }
.pedido.dragging { opacity: 0.4; transform: scale(0.98); }
.pedido-top { display: flex; align-items: center; gap: 10px; }
.pedido-cliente { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pedido-id { font-size: 11px; color: var(--muted); }
.pedido-platillo { margin: 12px 0 !important; color: #4b5263; font-size: 13px; line-height: 1.45; }
.pedido-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pedido-foot strong { font-size: 15px; }

/* ── Empleados ── */
.emp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.emp { padding: 16px; border-radius: 14px; background: #fbfbfe; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; transition: transform .18s, border-color .2s; }
.emp:hover { transform: translateY(-2px); }
.emp.on { border-color: #a7e3bd; background: #f6fdf9; }
.emp-top { display: flex; align-items: center; gap: 12px; }
.emp-top .avatar { width: 42px; height: 42px; font-size: 14px; }
.emp-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.status { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; }
.status i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status.ok { color: var(--ok); }
.status.ok i { box-shadow: 0 0 0 4px rgba(22,163,74,0.16); }
.status.off { color: var(--bad); }

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

/* ── Vacíos / toast / animaciones ── */
.empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 0; color: var(--muted); font-size: 13px; }
.empty.sm { padding: 26px 0; font-size: 12px; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 60; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #fff; box-shadow: 0 18px 40px -14px rgba(0,0,0,0.5); animation: slideIn .3s cubic-bezier(.2,.8,.2,1); }
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
  .kanban { grid-template-columns: 1fr; }
  .col { min-height: 0; }
  .charts { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .wrap { padding: 0 16px; }
  .hide-sm { display: none; }
  .btn { padding: 10px 12px; }
  .stats { grid-template-columns: 1fr; }
  .row2 { grid-template-columns: 1fr; }
  .search input { width: 120px; }
  .toast { left: 16px; right: 16px; bottom: 16px; }
}
`
