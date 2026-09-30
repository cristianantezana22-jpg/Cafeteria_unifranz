import type { EstadoClave } from "../types";

interface Estado {
  clave: EstadoClave;
  etiqueta: string;
}

export const ESTADOS: Estado[] = [
  { clave: "CONFIRMANDO_PAGO", etiqueta: "Confirmando pago" },
  { clave: "EN_PREPARACION", etiqueta: "En preparación" },
  { clave: "LISTO_PARA_RECOGER", etiqueta: "Listo para recoger" },
  { clave: "ENTREGADO", etiqueta: "Entregado" },
];

export function siguienteEstado(claveActual: EstadoClave): Estado | undefined {
  const indice = ESTADOS.findIndex((e) => e.clave === claveActual);
  return ESTADOS[indice + 1];
}