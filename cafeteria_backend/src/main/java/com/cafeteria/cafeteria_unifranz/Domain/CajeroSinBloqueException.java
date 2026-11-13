package com.cafeteria.cafeteria_unifranz.Domain;

public class CajeroSinBloqueException extends RuntimeException {

    public CajeroSinBloqueException() {
        super("Tu usuario de cajero no tiene un bloque asignado.");
    }
}
