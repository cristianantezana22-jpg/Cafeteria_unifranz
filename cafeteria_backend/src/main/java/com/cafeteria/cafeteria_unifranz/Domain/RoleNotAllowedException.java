package com.cafeteria.cafeteria_unifranz.Domain;

public class RoleNotAllowedException extends RuntimeException {

    public RoleNotAllowedException(String rol) {
<<<<<<< HEAD
        super("Tu rol (" + rol + ") no tiene una pantalla asignada en el sistema.");
=======
        super("Tu rol (" + rol + ") no tiene acceso al sistema de caja.");
>>>>>>> alan
    }
}
