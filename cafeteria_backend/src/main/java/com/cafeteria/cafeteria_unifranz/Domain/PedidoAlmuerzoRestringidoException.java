package com.cafeteria.cafeteria_unifranz.Domain;

public class PedidoAlmuerzoRestringidoException extends RuntimeException {

    public PedidoAlmuerzoRestringidoException(String bloque) {
        super("La caja del " + bloque + " no puede modificar pedidos de almuerzo.");
    }
}
