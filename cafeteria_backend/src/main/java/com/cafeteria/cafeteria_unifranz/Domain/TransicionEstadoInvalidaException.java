package com.cafeteria.cafeteria_unifranz.Domain;

public class TransicionEstadoInvalidaException extends RuntimeException {

    public TransicionEstadoInvalidaException(EstadoPedido actual, EstadoPedido destino) {
        super("No se puede pasar el pedido de " + actual + " a " + destino + ".");
    }
}
