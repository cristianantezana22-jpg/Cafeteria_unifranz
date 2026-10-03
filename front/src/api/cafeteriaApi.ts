import axios from "axios";
import type {
  ErrorApi,
  LoginRequest,
  LoginResponse,
  Pedido,
  Sesion,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

let sesionActiva: Sesion | null = null;

export function obtenerSesion(): Sesion | null {
  return sesionActiva;
}

export function cerrarSesion(): void {
  sesionActiva = null;
}

function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError<ErrorApi>(error)) {
    const mensaje = error.response?.data?.mensaje;
    if (mensaje) return mensaje;
    const status = error.response?.status;
    return status ? `Error del servidor (${status})` : "No se pudo conectar con el servidor";
  }
  return error instanceof Error ? error.message : "Error inesperado";
}

export async function login(usuario: string, password: string): Promise<Sesion> {
  const cuerpo: LoginRequest = { usuario, password };
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", cuerpo);
    sesionActiva = data;
    return data;
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  try {
    const { data } = await api.get<Pedido[]>("/pedidos");
    return data;
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}

export async function avanzarPedido(id: number): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/avanzar`);
    return data;
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}
