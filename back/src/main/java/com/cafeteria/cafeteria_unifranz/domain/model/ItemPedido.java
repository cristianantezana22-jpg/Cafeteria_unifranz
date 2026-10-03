package com.cafeteria.cafeteria_unifranz.domain.model;

public record ItemPedido(String nombre, int cantidad, double precio) {

    public double getSubtotal() {
        return cantidad * precio;
    }
}