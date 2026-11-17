package com.cafeteria.cafeteria_unifranz.Domain;

import java.math.BigDecimal;
import java.util.List;

public record NuevoPedido(
        Integer usuarioId,
        String usuarioEmail,
        String origen,
        String modalidadServicio,
        String metodoPago,
        String referenciaPago,
        List<Linea> lineas) {

    public BigDecimal total() {
        return lineas.stream().map(Linea::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public record Linea(Integer productoId, String nombre, int cantidad, BigDecimal precioUnitario) {
        public BigDecimal subtotal() {
            return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        }
    }
}