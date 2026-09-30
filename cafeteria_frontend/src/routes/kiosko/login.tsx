import { useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/kiosko/login')({
  component: KioskLogin,
});

function KioskLogin() {
  const [deviceUser, setDeviceUser] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: deviceUser, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('kiosk_token', data.token);
        localStorage.setItem('kiosk_block', data.block || 'BLOQUE_A');
        alert('Dispositivo Pantalla Autenticado correctamente');
        navigate({ to: '/kiosko' as any });
      } else {
        alert('Credenciales de pantalla inválidas');
      }
    } catch {
      alert('Error de conexión con el servidor backend');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Inicio de Sesión - Pantalla Pedestal</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Usuario Dispositivo:</label>
          <input 
            type="text" 
            value={deviceUser} 
            onChange={(e) => setDeviceUser(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            placeholder="ej. tableta_bloque_a"
            required 
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            required 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#D32F2F', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Activar Tableta
        </button>
      </form>
    </div>
  );
}

export default KioskLogin;