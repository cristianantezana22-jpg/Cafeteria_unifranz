package com.cafeteria.cafeteria_unifranz.Domain;

<<<<<<< HEAD
import java.util.Optional;

public enum UserRole {
    CLIENTE,
    CAJERO,
    ADMIN,
    PANTALLA;

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
=======
public enum UserRole {
    CAJERO
>>>>>>> alan
}
