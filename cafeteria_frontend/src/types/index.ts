export type EstadoClave =
  | "CONFIRMANDO_PAGO"
  | "EN_PREPARACION"
  | "LISTO_PARA_RECOGER"
  | "ENTREGADO";

export type MetodoPago = "QR" | "EFECTIVO";

export interface ItemPedido {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  cliente: string;
  items: ItemPedido[];
  metodoPago: MetodoPago;
  estado: EstadoClave;
  total: number;
}

export interface Sesion {
  nombre: string;
  token: string;
}

export interface ErrorApi {
  mensaje: string;
}