import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

interface Pedido {
  id: number
  cliente: string
  items: string
  total: number
  estado: 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO'
}

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria: string
  disponible: boolean
}

function AdminPage() {
  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('admin@cafeteria.com')
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')

  // Pestaña Activa del Panel
  const [activeTab, setActiveTab] = useState<'pedidos' | 'productos' | 'reportes'>('pedidos')

  // Estados de Datos
  const [pedidos, setPedidos] = useState<Pedido[]>([
    { id: 101, cliente: 'Carlos Perez', items: '2x Café Americano, 1x Donut', total: 42, estado: 'PENDIENTE' },
    { id: 102, cliente: 'Ana Gomez', items: '1x Cappuccino, 1x Tostada', total: 35, estado: 'EN_PREPARACION' },
    { id: 103, cliente: 'Luis Arce', items: '1x Espresso', total: 12, estado: 'ENTREGADO' },
    { id: 104, cliente: 'María López', items: '2x Cappuccino', total: 40, estado: 'ENTREGADO' },
  ])

  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, nombre: 'Café Cold Brew', precio: 15, categoria: 'Bebidas Calientes', disponible: true },
    { id: 2, nombre: 'Croissant Dulce', precio: 18, categoria: 'Repostería', disponible: true },
    { id: 3, nombre: 'Iced Coffee', precio: 20, categoria: 'Bebidas Frías', disponible: true },
    { id: 4, nombre: 'Tostada con Huevo', precio: 25, categoria: 'Desayunos', disponible: false },
  ])

  // Formulario nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevaCategoria, setNuevaCategoria] = useState('Bebidas Calientes')

  // Manejo de Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@cafeteria.com' && password === 'admin123') {
      setIsAuthenticated(true)
      setErrorLogin('')
    } else {
      setErrorLogin('Credenciales incorrectas. Usa admin@cafeteria.com / admin123')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
  }

  const cambiarEstadoPedido = (id: number, nuevoEstado: Pedido['estado']) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    )
  }

  const toggleDisponibilidadProducto = (id: number) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, disponible: !p.disponible } : p))
    )
  }

  const agregarProducto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre || !nuevoPrecio) return

    const nuevo: Producto = {
      id: Date.now(),
      nombre: nuevoNombre,
      precio: Number(nuevoPrecio),
      categoria: nuevaCategoria,
      disponible: true,
    }

    setProductos([...productos, nuevo])
    setNuevoNombre('')
    setNuevoPrecio('')
  }

  // Cálculos de Reportes
  const totalVentas = pedidos
    .filter((p) => p.estado === 'ENTREGADO')
    .reduce((sum, p) => sum + p.total, 0)

  const pedidosEntregados = pedidos.filter((p) => p.estado === 'ENTREGADO').length
  const pedidosPendientes = pedidos.filter((p) => p.estado !== 'ENTREGADO').length

  // 🔑 VISTA 1: LOGIN DEL ADMINISTRADOR (SI NO ESTÁ AUTENTICADO)
  if (!isAuthenticated) {
    return (
      <div className="auth-layout">
        {/* Imagen Lateral con Marca Unifranz */}
        <div className="auth-image">
          <div className="brand brand-light">
            <div className="brand-mark">U</div>
            <div>
              CAFETERÍA
              <small>UNIFRANZ</small>
            </div>
          </div>

          <div className="image-caption">
            <span className="eyebrow">HECHO DESPACIO, DISFRUTADO AQUÍ</span>
            <p>Un buen día empieza en la mesa.</p>
          </div>

          <div className="image-credit">PANEL ADMINISTRATIVO</div>
        </div>

        {/* Panel del Formulario */}
        <div className="auth-panel">
          <div className="auth-content">
            <div className="mobile-brand">
              <div className="brand">
                <div className="brand-mark">U</div>
                <div>
                  CAFETERÍA
                  <small>UNIFRANZ</small>
                </div>
              </div>
            </div>

            <span className="eyebrow accent">ACCESO ADMINISTRADOR</span>
            <h1>Bienvenido.</h1>
            <p className="auth-intro">Ingresa tus credenciales para administrar la plataforma.</p>

            <form onSubmit={handleLogin} className="login-form">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cafeteria.com"
                required
              />

              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {errorLogin && <p className="form-error">{errorLogin}</p>}

              <button type="submit" className="primary-button login-button">
                Acceder al Panel <span>↗</span>
              </button>
            </form>

            <p className="demo-hint">
              Acceso de prueba: <strong>admin@cafeteria.com</strong> / <strong>admin123</strong>
            </p>

            <div className="auth-footer">
              CAFETERÍA UNIFRANZ <span>—</span> PANEL DE CONTROL
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 📊 VISTA 2: PANEL ADMINISTRATIVO (SI YA INICIÓ SESIÓN)
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* SIDEBAR NAVEGACIÓN */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--line)',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div className="brand">
          <div className="brand-mark">U</div>
          <div>
            CAFETERÍA
            <small>UNIFRANZ</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('pedidos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
              backgroundColor: activeTab === 'pedidos' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'pedidos' ? '#ffffff' : 'var(--ink)',
              textAlign: 'left'
            }}
          >
            📋 Pedidos
          </button>

          <button
            onClick={() => setActiveTab('productos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
              backgroundColor: activeTab === 'productos' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'productos' ? '#ffffff' : 'var(--ink)',
              textAlign: 'left'
            }}
          >
            ☕ Productos
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
              backgroundColor: activeTab === 'reportes' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'reportes' ? '#ffffff' : 'var(--ink)',
              textAlign: 'left'
            }}
          >
            📊 Reportes
          </button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* TOPBAR */}
        <header className="topbar" style={{ padding: '0 40px' }}>
          <div className="location-label">
            <i /> LA PAZ, BOLIVIA
          </div>
          <div className="topbar-right">
            <span className="customer-name">Admin General</span>
            <span className="topbar-divider" />
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* WELCOME BAND */}
        <div className="welcome-band" style={{ minHeight: '180px', padding: '30px 40px' }}>
          <div>
            <span className="eyebrow">PANEL DE CONTROL</span>
            <h1>Administración Cafetería</h1>
            <p className="welcome-copy">Gestiona los pedidos, productos y ventas en tiempo real.</p>
          </div>
        </div>

        {/* VISTAS DE LAS PESTAÑAS */}
        <main style={{ padding: '40px', flex: 1 }}>
          
          {/* TAB 1: PEDIDOS */}
          {activeTab === 'pedidos' && (
            <>
              <div className="section-heading">
                <h2>Gestión de <span>Pedidos</span></h2>
                <span className="product-count">{pedidos.length} PEDIDOS EN SISTEMA</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ border: '1px solid var(--line)', padding: '20px', borderRadius: '4px', background: '#fff' }}>
                  <h3 style={{ fontFamily: 'DM Serif Display', color: 'var(--coral)', marginTop: 0 }}>Pendientes</h3>
                  {pedidos
                    .filter((p) => p.estado === 'PENDIENTE')
                    .map((p) => (
                      <div key={p.id} style={{ border: '1px solid var(--line)', padding: '16px', borderRadius: '4px', marginBottom: '12px', background: '#fafafa' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--forest)' }}>#{p.id}</span>
                        <h4 style={{ margin: '4px 0', fontSize: '15px' }}>{p.cliente}</h4>
                        <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--muted)' }}>{p.items}</p>
                        <strong style={{ color: 'var(--ink)', display: 'block', margin: '8px 0' }}>Bs. {p.total}</strong>
                        <button
                          className="primary-button"
                          style={{ height: '36px', fontSize: '11px', width: '100%' }}
                          onClick={() => cambiarEstadoPedido(p.id, 'EN_PREPARACION')}
                        >
                          Preparar ➔
                        </button>
                      </div>
                    ))}
                </div>

                <div style={{ border: '1px solid var(--line)', padding: '20px', borderRadius: '4px', background: '#fff' }}>
                  <h3 style={{ fontFamily: 'DM Serif Display', color: 'var(--ink)', marginTop: 0 }}>En Preparación</h3>
                  {pedidos
                    .filter((p) => p.estado === 'EN_PREPARACION')
                    .map((p) => (
                      <div key={p.id} style={{ border: '1px solid var(--line)', padding: '16px', borderRadius: '4px', marginBottom: '12px', background: '#fafafa' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--green-detail)' }}>#{p.id}</span>
                        <h4 style={{ margin: '4px 0', fontSize: '15px' }}>{p.cliente}</h4>
                        <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--muted)' }}>{p.items}</p>
                        <strong style={{ color: 'var(--ink)', display: 'block', margin: '8px 0' }}>Bs. {p.total}</strong>
                        <button
                          className="primary-button"
                          style={{ height: '36px', fontSize: '11px', width: '100%', background: 'var(--green-detail)' }}
                          onClick={() => cambiarEstadoPedido(p.id, 'ENTREGADO')}
                        >
                          Entregar ➔
                        </button>
                      </div>
                    ))}
                </div>

                <div style={{ border: '1px solid var(--line)', padding: '20px', borderRadius: '4px', background: '#fff' }}>
                  <h3 style={{ fontFamily: 'DM Serif Display', color: 'var(--muted)', marginTop: 0 }}>Entregados</h3>
                  {pedidos
                    .filter((p) => p.estado === 'ENTREGADO')
                    .map((p) => (
                      <div key={p.id} style={{ border: '1px solid var(--line)', padding: '16px', borderRadius: '4px', marginBottom: '12px', opacity: 0.75 }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--muted)' }}>#{p.id}</span>
                        <h4 style={{ margin: '4px 0', fontSize: '15px' }}>{p.cliente}</h4>
                        <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--muted)' }}>{p.items}</p>
                        <strong style={{ color: 'var(--ink)' }}>Bs. {p.total}</strong>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PRODUCTOS */}
          {activeTab === 'productos' && (
            <>
              <div className="section-heading">
                <h2>Gestión de <span>Productos</span></h2>
                <span className="product-count">{productos.length} PRODUCTOS REGISTRADOS</span>
              </div>

              <form onSubmit={agregarProducto} className="login-form" style={{
                background: '#fff',
                padding: '24px',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                marginBottom: '32px',
                marginTop: 0,
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: '16px',
                alignItems: 'end'
              }}>
                <div>
                  <label>Nombre del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej. Cold Brew"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div>
                  <label>Precio (Bs.)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div>
                  <label>Categoría</label>
                  <select
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    style={{
                      width: '100%',
                      height: '49px',
                      padding: '0 14px',
                      border: '1px solid #d9ded8',
                      borderRadius: '3px',
                      outline: 'none',
                      color: 'var(--ink)',
                      background: '#fff'
                    }}
                  >
                    <option value="Bebidas Calientes">Bebidas Calientes</option>
                    <option value="Bebidas Frías">Bebidas Frías</option>
                    <option value="Repostería">Repostería</option>
                    <option value="Desayunos">Desayunos</option>
                  </select>
                </div>
                <button type="submit" className="primary-button" style={{ height: '49px', padding: '0 24px' }}>
                  + Agregar
                </button>
              </form>

              <div className="product-grid">
                {productos.map((prod) => (
                  <div key={prod.id} style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    padding: '20px',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '1px' }}>
                        {prod.categoria.toUpperCase()}
                      </span>
                      <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '20px', margin: '8px 0' }}>{prod.nombre}</h3>
                      <span className="product-price" style={{ fontSize: '16px', fontWeight: 'bold' }}>Bs. {prod.precio}</span>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <button
                        className="add-to-cart-button"
                        onClick={() => toggleDisponibilidadProducto(prod.id)}
                        style={{
                          borderColor: prod.disponible ? 'var(--forest)' : '#a63f30',
                          color: prod.disponible ? 'var(--forest)' : '#a63f30'
                        }}
                      >
                        {prod.disponible ? 'Disponible (Marcar Agotado)' : 'Agotado (Marcar Disponible)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 3: REPORTES */}
          {activeTab === 'reportes' && (
            <>
              <div className="section-heading">
                <h2>Resumen y <span>Reportes</span></h2>
                <span className="product-count">ACTUALIZADO EN TIEMPO REAL</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--forest)', color: '#fff', padding: '28px', borderRadius: '4px' }}>
                  <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>VENTAS TOTALES</span>
                  <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '38px', margin: '10px 0 0' }}>Bs. {totalVentas}</h3>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '28px', borderRadius: '4px' }}>
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>PEDIDOS ENTREGADOS</span>
                  <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '38px', margin: '10px 0 0', color: 'var(--green-detail)' }}>
                    {pedidosEntregados}
                  </h3>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '28px', borderRadius: '4px' }}>
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>PEDIDOS EN COLA</span>
                  <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '38px', margin: '10px 0 0', color: 'var(--coral)' }}>
                    {pedidosPendientes}
                  </h3>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '24px', borderRadius: '4px' }}>
                <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '22px', marginTop: 0 }}>Historial de Transacciones</h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                      <th style={{ padding: '12px 8px' }}>ID</th>
                      <th style={{ padding: '12px 8px' }}>Cliente</th>
                      <th style={{ padding: '12px 8px' }}>Detalle</th>
                      <th style={{ padding: '12px 8px' }}>Total</th>
                      <th style={{ padding: '12px 8px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>#{p.id}</td>
                        <td style={{ padding: '12px 8px' }}>{p.cliente}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--muted)' }}>{p.items}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--forest)' }}>Bs. {p.total}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            background: p.estado === 'ENTREGADO' ? '#f0faf4' : '#fff5f5',
                            color: p.estado === 'ENTREGADO' ? 'var(--green-detail)' : 'var(--coral)'
                          }}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}