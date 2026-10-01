import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F5F8',
      }}
    >
      <h1 style={{ color: '#1F2937', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Sistema Cafetería Unifranz
      </h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Selecciona un módulo para ingresar:
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {}
        <Link
          to="/kiosko"
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#A60297',
            color: '#FFFFFF',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(166, 2, 151, 0.25)',
            transition: 'transform 0.2s',
          }}
        >
          Kiosco Cliente
        </Link>

        {}
        <a
          href="/admin"
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#239960',
            color: '#FFFFFF',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(35, 153, 96, 0.25)',
            transition: 'transform 0.2s',
          }}
        >
           Panel Admin / Cocina
        </a>
      </div>
    </div>
  );
}