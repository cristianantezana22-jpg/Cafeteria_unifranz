import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { Pedido } from "../types";
import { obtenerPedidos, avanzarPedido } from "../api/cafeteriaApi";
import { cerrarSesion, obtenerSesion } from "../auth/sesion";
import { ESTADOS, siguienteEstado } from "../utils/estados";
import PedidoCard from "../components/PedidoCard";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!obtenerSesion()) {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState("");

  async function cargarPedidos() {
    try {
      setPedidos(await obtenerPedidos());
      setError("");
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  }

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function manejarAvance(pedido: Pedido) {
    const siguiente = siguienteEstado(pedido.estado);
    if (!siguiente) return;

    const confirmado = window.confirm(
      `¿Pasar el pedido #${pedido.id} a "${siguiente.etiqueta}"?`
    );
    if (!confirmado) return;

    try {
      const actualizado = await avanzarPedido(pedido.id);
      setPedidos((actuales) =>
        actuales.map((p) => (p.id === actualizado.id ? actualizado : p))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    }
  }

  function manejarSalida() {
    cerrarSesion();
    navigate({ to: "/" });
  }

  return (
    <div>
      <header className="encabezado">
        <div>
          <h1>Pedidos - Cafetería UNIFRANZ</h1>
          <small><span className="punto-verde"></span>Sesión: {sesion?.nombre}</small>
        </div>
        <button className="boton boton-salir" onClick={manejarSalida}>Salir</button>
      </header>

      {error && <div className="error" style={{ padding: "8px 32px" }}>{error}</div>}

      <main className="tablero">
        {ESTADOS.map((estado) => {
          const pedidosDelEstado = pedidos.filter((p) => p.estado === estado.clave);
          return (
            <section className="columna" key={estado.clave}>
              <h2>
                {estado.etiqueta}
                <span className="contador">{pedidosDelEstado.length}</span>
              </h2>

              {pedidosDelEstado.length === 0 && <p className="vacio">Sin pedidos</p>}

              {pedidosDelEstado.map((pedido) => (
                <PedidoCard key={pedido.id} pedido={pedido} onAvanzar={manejarAvance} />
              ))}
            </section>
          );
        })}
      </main>
    </div>
  );
}