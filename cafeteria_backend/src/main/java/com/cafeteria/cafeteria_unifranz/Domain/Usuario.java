package com.cafeteria.cafeteria_unifranz.Domain;

public record Usuario(
        Integer id,
        String nombreCompleto,
        String email,
        String passwordHash,
        String rol) {
}
