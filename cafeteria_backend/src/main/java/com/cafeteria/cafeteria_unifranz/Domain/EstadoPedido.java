package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.Optional;

public enum EstadoPedido {
    PENDIENTE,
    EN_PREPARACION,
    LISTO,
    ENTREGADO,
    CANCELADO;

    public Optional<EstadoPedido> siguiente() {
        return switch (this) {
            case PENDIENTE -> Optional.of(EN_PREPARACION);
            case EN_PREPARACION -> Optional.of(LISTO);
            case LISTO -> Optional.of(ENTREGADO);
            case ENTREGADO, CANCELADO -> Optional.empty();
        };
    }

    public boolean puedeCancelarse() {
        return this == PENDIENTE;
    }

    public boolean puedeTransicionarA(EstadoPedido destino) {
        if (destino == CANCELADO) {
            return puedeCancelarse();
        }
        return siguiente().map(estado -> estado == destino).orElse(false);
    }

    public static Optional<EstadoPedido> fromDatabaseValue(String value) {
        if (value == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(valueOf(value.trim().toUpperCase()));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
