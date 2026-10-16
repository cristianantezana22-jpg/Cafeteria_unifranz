package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.Optional;

/** Roles que tienen una pantalla asignada en el frontend. */
public enum UserRole {
    CLIENTE,
    CAJERO,
    ADMIN,
    PANTALLA;

    /** Convierte el valor de usuarios.rol; vacío si el rol no tiene pantalla (p. ej. COCINA). */
    public static Optional<UserRole> fromDatabaseValue(String value) {
        if (value == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(valueOf(value.trim().toUpperCase()));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
