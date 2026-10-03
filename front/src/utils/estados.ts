import type { EstadoClave } from "../types";

interface Estado {
  clave: EstadoClave;
  etiqueta: string;
  color: string;
}

export const ESTADOS: Estado[] = [
  { clave: "CONFIRMANDO_PAGO", etiqueta: "Confirmando pago", color: "#DE1BB9" },
  { clave: "EN_PREPARACION", etiqueta: "En preparación", color: "#b8159a" },
  { clave: "LISTO_PARA_RECOGER", etiqueta: "Listo para recoger", color: "#239960" },
  { clave: "ENTREGADO", etiqueta: "Entregado", color: "#6b6b6b" },
];

export function estadoPorClave(clave: EstadoClave): Estado {
  return ESTADOS.find((e) => e.clave === clave) ?? ESTADOS[0];
}

export function siguienteEstado(claveActual: EstadoClave): Estado | undefined {
  const indice = ESTADOS.findIndex((e) => e.clave === claveActual);
  return ESTADOS[indice + 1];
}
