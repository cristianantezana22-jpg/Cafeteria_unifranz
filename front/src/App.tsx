import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { cerrarSesion } from "./api/cafeteriaApi";

function App() {
  const [logueado, setLogueado] = useState(false);

  function manejarSalir() {
    cerrarSesion();
    setLogueado(false);
  }

  if (logueado) {
    return <DashboardPage onSalir={manejarSalir} />;
  }

  return <LoginPage onLogin={() => setLogueado(true)} />;
}

export default App;
