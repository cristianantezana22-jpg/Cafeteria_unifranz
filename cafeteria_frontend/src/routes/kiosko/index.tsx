import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/kiosko/')({
  component: KioskIndex,
});

function KioskIndex() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate({ to: '/kiosko/menu' })}
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #6B0060 0%, #A60297 50%, #4A0043 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#FFFFFF',
        cursor: 'pointer',
        padding: '1.5rem',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(35, 153, 96, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 22px rgba(35, 153, 96, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(35, 153, 96, 0); }
        }
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, 50px) scale(1.1); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(0.95); }
        }
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Luces Flotantes Animadas de Fondo */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,85,223,0.35) 0%, rgba(0,0,0,0) 70%)',
          top: '-10%',
          left: '-10%',
          filter: 'blur(60px)',
          animation: 'floatOrb1 12s infinite ease-in-out',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(142,36,170,0.45) 0%, rgba(0,0,0,0) 70%)',
          bottom: '-15%',
          right: '-10%',
          filter: 'blur(70px)',
          animation: 'floatOrb2 15s infinite ease-in-out',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(35,153,96,0.3) 0%, rgba(0,0,0,0) 70%)',
          top: '35%',
          right: '15%',
          filter: 'blur(50px)',
          animation: 'floatOrb3 10s infinite ease-in-out',
          pointerEvents: 'none',
        }}
      />

      {/* Header con Logos en Glassmorphism */}
      <div
        style={{
          position: 'absolute',
          top: '35px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '10px 28px',
          borderRadius: '50px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          maxWidth: '90%',
          zIndex: 3,
          animation: 'subtleBounce 4s ease-in-out infinite',
        }}
      >
        <img
          src="/unifranz.png"
          alt="Unifranz Logo"
          style={{ height: '50px', objectFit: 'contain' }}
        />
        <div style={{ width: '2px', height: '35px', backgroundColor: '#E0E0E0' }} />
        <img
          src="/pinkpepper.png"
          alt="Pink Pepper Logo"
          style={{ height: '55px', objectFit: 'contain' }}
        />
      </div>

      {/* Contenido Central */}
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
          fontWeight: 900,
          marginBottom: '0.8rem',
          marginTop: '100px',
          textAlign: 'center',
          letterSpacing: '1.5px',
          textShadow: '0 4px 20px rgba(0,0,0,0.35)',
          zIndex: 2,
        }}
      >
        CAFETERÍA UNIFRANZ
      </h1>

      <p
        style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          marginBottom: '3rem',
          opacity: 0.92,
          textAlign: 'center',
          letterSpacing: '0.5px',
          zIndex: 2,
        }}
      >
        Toca la pantalla para hacer tu pedido
      </p>

      {/* Botón Principal con Animación de Pulso Verde */}
      <button
        style={{
          backgroundColor: '#FFFFFF',
          color: '#A60297',
          fontSize: 'clamp(1.1rem, 2.8vw, 1.5rem)',
          fontWeight: 900,
          padding: '1.2rem 3.5rem',
          borderRadius: '50px',
          border: '3px solid #239960',
          cursor: 'pointer',
          animation: 'pulseGlow 2.5s infinite',
          letterSpacing: '1px',
          zIndex: 2,
        }}
      >
        ¡INICIAR PEDIDO AQUÍ!
      </button>

      <p
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          opacity: 0.7,
          fontSize: '0.9rem',
          zIndex: 2,
        }}
      >
        Atención rápida y pago digital disponible
      </p>
    </div>
  );
}

export default KioskIndex;