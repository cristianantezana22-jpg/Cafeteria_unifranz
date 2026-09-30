import type { ErrorApi, Pedido, Sesion } from "../types";

const API_URL: string = import.meta.env.VITE_API_URL;

async function leerRespuesta<T>(respuesta: Response): Promise<T> {
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error((datos as ErrorApi).mensaje);
  }
  return datos as T;
}

export async function login(usuario: string, password: string): Promise<Sesion> {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, password }),
  });
  return leerRespuesta<Sesion>(respuesta);
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  const respuesta = await fetch(`${API_URL}/pedidos`);
  return leerRespuesta<Pedido[]>(respuesta);
}

export async function avanzarPedido(id: number): Promise<Pedido> {
  const respuesta = await fetch(`${API_URL}/pedidos/${id}/avanzar`, {
    method: "PATCH",
  });
  return leerRespuesta<Pedido>(respuesta);
}