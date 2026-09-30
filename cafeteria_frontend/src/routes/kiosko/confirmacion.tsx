import { useEffect } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';

export const Route = createFileRoute('/kiosko/confirmacion')({
  component: KioskConfirmation,
});

function KioskConfirmation() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/kiosko/confirmacion' }) as { ticket?: string; method?: string };

  // Regresar automáticamente al salvapantallas tras 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: '/kiosko' as any });
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#A60297',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        color: '#FFFFFF',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          color: '#333333',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3.8rem', marginBottom: '0.5rem' }}></div>
        <h2 style={{ color: '#A60297', marginTop: 0, fontSize: '1.8rem' }}>¡Pedido Recibido con Éxito!</h2>
        <p style={{ color: '#666', fontSize: '1rem', marginBottom: '1.2rem' }}>
          Tu número de ticket para retirar es:
        </p>

        {}
        <div
          style={{
            backgroundColor: '#F8F9FA',
            border: '3px dashed #A60297',
            borderRadius: '16px',
            padding: '1.2rem',
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: '#239960',
            letterSpacing: '2px',
            marginBottom: '1.2rem',
          }}
        >
          #{search.ticket || 'A01'}
        </div>

        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '1.5rem' }}>
          {search.method === 'QR'
            ? 'Escanea el código en la pantalla de la caja para confirmar.'
            : 'Por favor acércate a la caja para cancelar tu pedido.'}
        </p>

        <button
          onClick={() => navigate({ to: '/kiosko' as any })}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: '#A60297',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Finalizar y Volver al Inicio
        </button>
      </div>

      <p style={{ marginTop: '1.8rem', opacity: 0.8, fontSize: '0.9rem' }}>
        Esta pantalla volverá al inicio automáticamente en 10 segundos...
      </p>
    </div>
  );
}

export default KioskConfirmation;