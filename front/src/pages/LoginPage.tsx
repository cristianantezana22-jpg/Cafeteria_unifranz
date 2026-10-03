import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "../api/cafeteriaApi";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    try {
      await login(usuario, password);
      onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    }
  }

  return (
    <div className="login-fondo">
      <form className="login-caja" onSubmit={manejarEnvio}>
        <h1>CAFETERÍA UNIFRANZ</h1>
        <p>Acceso para cajeros</p>

        <input placeholder="Usuario" value={usuario}
               onChange={(e) => setUsuario(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password}
               onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="error">{error}</div>}
        <button className="boton" type="submit">Ingresar</button>
      </form>
    </div>
  );
}
