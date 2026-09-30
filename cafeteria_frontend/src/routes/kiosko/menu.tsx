import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { sendKioskOrder, type OrderItem } from '../../services/kioskService';

export const Route = createFileRoute('/kiosko/menu')({
  component: KioskMenu,
});

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Empanada de Queso', price: 5.0, category: 'Snacks' },
  { id: 2, name: 'Café Pasado', price: 4.0, category: 'Bebidas' },
  { id: 3, name: 'Almuerzo Ejecutivo', price: 15.0, category: 'Platos' },
  { id: 4, name: 'Jugo Natural', price: 6.0, category: 'Bebidas' },
];

function KioskMenu() {
  const navigate = useNavigate();
  const [selectedBlock, setSelectedBlock] = useState<'BLOQUE_A' | 'BLOQUE_B'>('BLOQUE_A');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        navigate({ to: '/kiosko' as any });
      }, 10000);
    };

    const events = ['touchstart', 'mousemove', 'mousedown', 'keydown', 'click', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [navigate]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handlePay = async (paymentMethod: 'QR' | 'EFECTIVO') => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const response = await sendKioskOrder({
        block: selectedBlock,
        paymentMethod: paymentMethod,
        items: orderItems,
      });

      navigate({
        to: '/kiosko/confirmacion',
        search: {
          ticket: response.ticketNumber,
          method: paymentMethod,
        },
      });
    } catch (error) {
      alert('Error al enviar la orden al servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#F4F5F8',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        userSelect: 'none',
      }}
    >
      <style>{`
        /* Animaciones de Flotación Orgánica */
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(90px, -70px) scale(1.1); }
          66% { transform: translate(-50px, 60px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 90px) scale(0.9); }
          66% { transform: translate(60px, -50px) scale(1.12); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(70px, 80px) scale(1.08); }
          66% { transform: translate(-90px, -60px) scale(0.92); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-100px, -60px) scale(1.15); }
          66% { transform: translate(80px, 70px) scale(0.96); }
        }

        .product-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(166, 2, 151, 0.15) !important;
        }
      `}</style>

      {/* Navbar Superior */}
      <header
        style={{
          backgroundColor: '#A60297',
          color: '#FFFFFF',
          padding: '0.8rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#FFFFFF',
            padding: '6px 18px',
            borderRadius: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <img src="/unifranz.png" alt="Unifranz" style={{ height: '32px', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '24px', backgroundColor: '#DDD' }} />
          <img src="/pinkpepper.png" alt="Pink Pepper" style={{ height: '36px', objectFit: 'contain' }} />
        </div>

        {/* Selector de Ubicación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.5px' }}>UBICACIÓN:</span>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '25px', padding: '4px', display: 'flex' }}>
            <button
              onClick={() => setSelectedBlock('BLOQUE_A')}
              style={{
                backgroundColor: selectedBlock === 'BLOQUE_A' ? '#FFFFFF' : 'transparent',
                color: selectedBlock === 'BLOQUE_A' ? '#A60297' : '#FFFFFF',
                border: 'none',
                padding: '7px 18px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedBlock === 'BLOQUE_A' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              Bloque A
            </button>
            <button
              onClick={() => setSelectedBlock('BLOQUE_B')}
              style={{
                backgroundColor: selectedBlock === 'BLOQUE_B' ? '#FFFFFF' : 'transparent',
                color: selectedBlock === 'BLOQUE_B' ? '#A60297' : '#FFFFFF',
                border: 'none',
                padding: '7px 18px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedBlock === 'BLOQUE_B' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              Bloque B
            </button>
          </div>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap-reverse', position: 'relative', overflow: 'hidden' }}>
        
        {/* FONDO CON 4 CÍRCULOS FLOTANDO (#E3A6E0 y #94E3AC) */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {/* Círculo 1: #E3A6E0 (Arriba Izquierda) */}
          <div
            style={{
              position: 'absolute',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              backgroundColor: '#E3A6E0',
              opacity: 0.5,
              filter: 'blur(50px)',
              top: '-40px',
              left: '-40px',
              animation: 'float1 14s ease-in-out infinite',
            }}
          />

          {/* Círculo 2: #E3A6E0 (Abajo Derecha) */}
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              backgroundColor: '#E3A6E0',
              opacity: 0.45,
              filter: 'blur(45px)',
              bottom: '10%',
              right: '25%',
              animation: 'float2 18s ease-in-out infinite',
            }}
          />

          {/* Círculo 3: #94E3AC (Arriba Derecha) */}
          <div
            style={{
              position: 'absolute',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              backgroundColor: '#94E3AC',
              opacity: 0.5,
              filter: 'blur(55px)',
              top: '5%',
              right: '-60px',
              animation: 'float3 16s ease-in-out infinite',
            }}
          />

          {/* Círculo 4: #94E3AC (Abajo Izquierda) */}
          <div
            style={{
              position: 'absolute',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              backgroundColor: '#94E3AC',
              opacity: 0.55,
              filter: 'blur(45px)',
              bottom: '-50px',
              left: '12%',
              animation: 'float4 20s ease-in-out infinite',
            }}
          />
        </div>

        {/* Sección de Productos */}
        <main style={{ flex: 1, padding: '2rem 1.5rem', minWidth: '300px', zIndex: 1 }}>
          <h2 style={{ color: '#1F2937', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
            Selecciona tus productos
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.4rem' }}>
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="product-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '1.4rem 1.2rem',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#239960',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      marginBottom: '0.8rem',
                    }}
                  >
                    {prod.category}
                  </span>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#1F2937', fontWeight: 700 }}>
                    {prod.name}
                  </h3>
                  <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#A60297', margin: '0 0 1.2rem 0' }}>
                    Bs. {prod.price.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  style={{
                    backgroundColor: '#A60297',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(166, 2, 151, 0.25)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  + Agregar
                </button>
              </div>
            ))}
          </div>
        </main>

        {/* Panel del Carrito (Derecha) */}
        <aside
          style={{
            width: '340px',
            backgroundColor: '#FFFFFF',
            borderLeft: '1px solid #E5E7EB',
            padding: '1.8rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.04)',
            minWidth: '290px',
            zIndex: 2,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.2rem',
                borderBottom: '2px solid #F3F4F6',
                paddingBottom: '0.8rem',
              }}
            >
              <h2 style={{ margin: 0, color: '#A60297', fontSize: '1.25rem', fontWeight: 800 }}>
                Tu Pedido ({selectedBlock === 'BLOQUE_A' ? 'Bloque A' : 'Bloque B'})
              </h2>
              <span
                style={{
                  backgroundColor: '#239960',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                {cart.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>
                No has seleccionado productos aún.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '360px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#F9FAFB',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '12px',
                      border: '1px solid #F3F4F6',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.92rem' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#A60297', fontWeight: 700 }}>
                        Bs. {(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        style={{
                          backgroundColor: '#EF4444',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '8px',
                          width: '28px',
                          height: '28px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.product)}
                        style={{
                          backgroundColor: '#239960',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '8px',
                          width: '28px',
                          height: '28px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '2px solid #F3F4F6', paddingTop: '1.2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.2rem', color: '#111827' }}>
              <span>Total:</span>
              <span style={{ color: '#239960' }}>Bs. {total.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handlePay('QR')}
                disabled={cart.length === 0 || isSubmitting}
                style={{
                  backgroundColor: cart.length > 0 ? '#239960' : '#D1D5DB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: cart.length > 0 ? '0 4px 12px rgba(35, 153, 96, 0.3)' : 'none',
                }}
              >
                Pagar con QR
              </button>

              <button
                onClick={() => handlePay('EFECTIVO')}
                disabled={cart.length === 0 || isSubmitting}
                style={{
                  backgroundColor: cart.length > 0 ? '#A60297' : '#E5E7EB',
                  color: cart.length > 0 ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: cart.length > 0 ? '0 4px 12px rgba(166, 2, 151, 0.25)' : 'none',
                }}
              >
                Pagar en Caja (Efectivo)
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}