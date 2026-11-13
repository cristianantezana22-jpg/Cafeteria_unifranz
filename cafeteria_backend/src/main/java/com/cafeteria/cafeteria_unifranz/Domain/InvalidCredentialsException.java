package com.cafeteria.cafeteria_unifranz.Domain;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Correo o contraseña incorrectos.");
    }
}
