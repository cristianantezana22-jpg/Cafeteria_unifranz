package com.cafeteria.cafeteria_unifranz.domain.exception;

public class PedidoNoEncontradoException extends RuntimeException {
    public PedidoNoEncontradoException(Long id) {
        super("Pedido no encontrado: " + id);
    }
}