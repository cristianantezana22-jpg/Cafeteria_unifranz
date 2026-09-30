import type { Sesion } from "../types";

const CLAVE = "sesion-cajero";

export function guardarSesion(sesion: Sesion): void {
  sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export function obtenerSesion(): Sesion | null {
  const texto = sessionStorage.getItem(CLAVE);
  return texto ? (JSON.parse(texto) as Sesion) : null;
}

export function cerrarSesion(): void {
  sessionStorage.removeItem(CLAVE);
}