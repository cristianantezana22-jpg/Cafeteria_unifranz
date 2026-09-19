import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/kiosko')({
  component: KioscoAutopedido,
})

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen: string
}

const MENU_KIOSKO: Producto[] = [
  { id: 1, nombre: 'Almuerzo ', precio: 15, categoria: 'Platos', imagen: '🍲' },
  { id: 2, nombre: 'Hamburguesa', precio: 12, categoria: 'Platos', imagen: '🍔' },
  { id: 3, nombre: 'Sandwich de Silpancho', precio: 8, categoria: 'Snacks', imagen: '🥪' },
  { id: 4, nombre: 'Empanada de Queso', precio: 4, categoria: 'Snacks', imagen: '🥟' },
  { id: 5, nombre: 'Café', precio: 6, categoria: 'Bebidas', imagen: '☕' },
  { id: 6, nombre: 'Jugo del día', precio: 6, categoria: 'Bebidas', imagen: '🥤' },
  { id: 7, nombre: 'Refresco 500ml', precio: 5, categoria: 'Bebidas', imagen: '🥤' },
  { id: 8, nombre: 'Pastel de Limón', precio: 7, categoria: 'Postres', imagen: '🍰' },
]

function KioscoAutopedido() {
  const [bloque, setBloque] = useState<'A' | 'B'>('A')
  const [categoriaSel, setCategoriaSel] = useState<string>('Todos')
  const [carrito, setCarrito] = useState<{ producto: Producto; cantidad: number }[]>([])
  const [paso, setPaso] = useState<'menu' | 'pago' | 'confirmacion'>('menu')
  const [ticketActual, setTicketActual] = useState<string>('')

  const categorias = ['Todos', 'Platos', 'Snacks', 'Bebidas', 'Postres']

  const agregarProducto = (prod: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === prod.id)
      if (existe) {
        return prev.map((item) =>
          item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [...prev, { producto: prod, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === id) {
            const nuevaCantidad = item.cantidad + delta
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null
          }
          return item
        })
        .filter(Boolean) as { producto: Producto; cantidad: number }[]
    )
  }

  const total = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)

  const procesarPago = () => {
    const numTicket = `${bloque}-${Math.floor(100 + Math.random() * 900)}`
    setTicketActual(numTicket)
    setPaso('confirmacion')
  }

  const reiniciarKiosco = () => {
    setCarrito([])
    setPaso('menu')
    setTicketActual('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdfbf7', fontFamily: 'Arial, sans-serif', userSelect: 'none' }}>
      {}
      <header style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #e65100', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f57c00' }}>
            UNIFRANZ <span style={{ color: '#fff', fontWeight: 'normal', fontSize: '22px' }}>| Pantalla de Autopedido</span>
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#ccc', fontSize: '14px' }}>Toca la pantalla para armar tu pedido</p>
        </div>
        
        {}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#2b2b2b', padding: '6px', borderRadius: '12px' }}>
          <button
            onClick={() => setBloque('A')}
            style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', backgroundColor: bloque === 'A' ? '#e65100' : 'transparent', color: '#fff', cursor: 'pointer', transition: '0.2s' }}
          >
            BLOQUE A
          </button>
          <button
            onClick={() => setBloque('B')}
            style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', backgroundColor: bloque === 'B' ? '#e65100' : 'transparent', color: '#fff', cursor: 'pointer', transition: '0.2s' }}
          >
            BLOQUE B
          </button>
        </div>
      </header>

      {}
      {paso === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: 'calc(100vh - 84px)' }}>
          {}
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            {}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSel(cat)}
                  style={{
                    padding: '14px 28px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    border: '2px solid ' + (categoriaSel === cat ? '#e65100' : '#e0dcd3'),
                    backgroundColor: categoriaSel === cat ? '#e65100' : '#fff',
                    color: categoriaSel === cat ? '#fff' : '#1a1a1a',
                    cursor: 'pointer',
                    boxShadow: categoriaSel === cat ? '0 4px 12px rgba(230,81,0,0.3)' : '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {MENU_KIOSKO
                .filter((p) => categoriaSel === 'Todos' || p.categoria === categoriaSel)
                .map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => agregarProducto(prod)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      border: '1px solid #eae6df',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between' 
                    }}
                  >
                    <div style={{ fontSize: '56px', marginBottom: '12px' }}>{prod.imagen}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>{prod.nombre}</div>
                    <div style={{ fontSize: '20px', color: '#e65100', fontWeight: 'bold', marginBottom: '12px' }}>Bs. {prod.precio}</div>
                    <button style={{ backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', pointerEvents: 'none' }}>
                      + Agregar
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {}
          <div style={{ backgroundColor: '#fff', borderLeft: '2px solid #eae6df', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '22px', borderBottom: '2px solid #f0ece1', paddingBottom: '12px', marginTop: 0, color: '#1a1a1a' }}>Tu Orden</h2>
              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '60px', fontSize: '18px' }}>
                  🛒<br /><br />Tu orden está vacía.<br />Toca un producto para agregar.
                </div>
              ) : (
                <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                  {carrito.map((item) => (
                    <div key={item.producto.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f4f0e8' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a1a' }}>{item.producto.nombre}</div>
                        <div style={{ color: '#e65100', fontWeight: 'bold', fontSize: '14px' }}>Bs. {item.producto.precio * item.cantidad}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => cambiarCantidad(item.producto.id, -1)} style={{ width: '36px', height: '36px', fontSize: '18px', fontWeight: 'bold', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fdfbf7', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.producto.id, 1)} style={{ width: '36px', height: '36px', fontSize: '18px', fontWeight: 'bold', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fdfbf7', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {}
            <div style={{ borderTop: '2px solid #f0ece1', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                <span style={{ color: '#1a1a1a' }}>Total:</span>
                <span style={{ color: '#e65100' }}>Bs. {total}</span>
              </div>
              <button
                disabled={carrito.length === 0}
                onClick={() => setPaso('pago')}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: carrito.length > 0 ? '#e65100' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: carrito.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: carrito.length > 0 ? '0 4px 12px rgba(230,81,0,0.3)' : 'none'
                }}
              >
                IR A PAGAR
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {paso === 'pago' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', maxWidth: '450px', width: '100%', border: '1px solid #eae6df' }}>
            <h2 style={{ fontSize: '26px', margin: '0 0 8px 0', color: '#1a1a1a' }}>Escanea para pagar</h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>Abre tu banca móvil y escanea el código QR</p>
            
            <div style={{ width: '220px', height: '220px', backgroundColor: '#fdfbf7', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '2px solid #e65100' }}>
              <span style={{ fontSize: '100px' }}>📱</span>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e65100', marginBottom: '24px' }}>
              Monto: Bs. {total}
            </div>

            <button
              onClick={procesarPago}
              style={{ width: '100%', padding: '18px', backgroundColor: '#e65100', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 4px 12px rgba(230,81,0,0.2)' }}
            >
              Simular Pago Exitoso
            </button>

            <button
              onClick={() => setPaso('menu')}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Volver al menú
            </button>
          </div>
        </div>
      )}

      {}
      {paso === 'confirmacion' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '48px', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', maxWidth: '500px', width: '100%', border: '1px solid #eae6df' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}></div>
            <h2 style={{ fontSize: '28px', color: '#e65100', margin: '0 0 12px 0' }}>¡Pedido Confirmado!</h2>
            <p style={{ color: '#444', fontSize: '18px', margin: '0 0 24px 0' }}>Retira tu pedido en el mostrador del <strong>BLOQUE {bloque}</strong> cuando muestren tu ticket:</p>
            
            <div style={{ backgroundColor: '#1a1a1a', border: '2px solid #e65100', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              <span style={{ fontSize: '14px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>Tu Número de Ticket</span>
              <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#f57c00', marginTop: '8px' }}>{ticketActual}</div>
            </div>

            <button
              onClick={reiniciarKiosco}
              style={{ width: '100%', padding: '20px', backgroundColor: '#e65100', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              FINALIZAR Y VOLVER AL INICIO
            </button>
          </div>
        </div>
      )}
    </div>
  )
}