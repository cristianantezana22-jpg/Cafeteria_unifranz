package com.cafeteria.cafeteria_unifranz.domain.model;

import com.cafeteria.cafeteria_unifranz.domain.exception.EstadoInvalidoException;

public enum EstadoPedido {
    CONFIRMANDO_PAGO,
    EN_PREPARACION,
    LISTO_PARA_RECOGER,
    ENTREGADO;

    public EstadoPedido siguiente() {
        if (this == ENTREGADO) {
            throw new EstadoInvalidoException("El pedido ya fue entregado");
        }
        return values()[this.ordinal() + 1];
    }
}