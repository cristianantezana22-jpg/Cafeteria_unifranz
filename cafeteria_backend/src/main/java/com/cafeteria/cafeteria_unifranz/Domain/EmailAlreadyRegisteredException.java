package com.cafeteria.cafeteria_unifranz.Domain;

public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException() {
        super("Ya existe una cuenta registrada con ese correo.");
    }
}
