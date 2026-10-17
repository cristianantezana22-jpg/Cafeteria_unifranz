package com.cafeteria.cafeteria_unifranz.Domain;

public class RoleNotAllowedException extends RuntimeException {

    public RoleNotAllowedException(String rol) {
        super("Tu rol (" + rol + ") no tiene una pantalla asignada en el sistema.");
    }
}
