import type { Pedido } from "../types";
import { siguienteEstado } from "../utils/estados";

interface PedidoCardProps {
  pedido: Pedido;
  onAvanzar: (pedido: Pedido) => void;
}

export default function PedidoCard({ pedido, onAvanzar }: PedidoCardProps) {
  const siguiente = siguienteEstado(pedido.estado);

  return (
    <div className="tarjeta">
      <div className="tarjeta-titulo">
        <span>#{pedido.id} · {pedido.cliente}</span>
        <span className="pago">{pedido.metodoPago === "QR" ? "QR" : "Efectivo"}</span>
      </div>

      <ul>
        {pedido.items.map((item, i) => (
          <li key={i}>{item.cantidad}x {item.nombre}</li>
        ))}
      </ul>

      <div className="total">Total: Bs. {pedido.total.toFixed(2)}</div>

      {siguiente && (
        <button className="boton" onClick={() => onAvanzar(pedido)}>
          Pasar a: {siguiente.etiqueta}
        </button>
      )}
    </div>
  );
}