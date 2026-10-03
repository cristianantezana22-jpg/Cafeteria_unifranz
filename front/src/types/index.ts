export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  nombre: string;
  token: string;
}

export type Sesion = LoginResponse;

export type EstadoClave =
  | "CONFIRMANDO_PAGO"
  | "EN_PREPARACION"
  | "LISTO_PARA_RECOGER"
  | "ENTREGADO";

export type MetodoPago = "QR" | "EFECTIVO";

export interface ItemPedidoResponse {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface PedidoResponse {
  id: number;
  cliente: string;
  items: ItemPedidoResponse[];
  metodoPago: MetodoPago;
  estado: EstadoClave;
  total: number;
}

export type Pedido = PedidoResponse;
export type ItemPedido = ItemPedidoResponse;

export interface ErrorApi {
  mensaje: string;
}
