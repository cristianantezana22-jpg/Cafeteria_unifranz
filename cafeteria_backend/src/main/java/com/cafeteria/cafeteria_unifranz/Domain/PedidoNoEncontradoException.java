package com.cafeteria.cafeteria_unifranz.Domain;

public class PedidoNoEncontradoException extends RuntimeException {

    public PedidoNoEncontradoException() {
        super("El pedido no existe.");
    }
}
