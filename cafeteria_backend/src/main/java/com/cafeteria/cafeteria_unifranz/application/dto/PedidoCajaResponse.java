package com.cafeteria.cafeteria_unifranz.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoCajaResponse(
        Integer id,
        String ticket,
        String estado,
        String origen,
        String cliente,
        String metodoPago,
        String estadoPago,
        BigDecimal total,
        LocalDateTime creadoEn,
        boolean almuerzo,
        boolean editable,
        String siguienteEstado,
        boolean cancelable,
        List<Item> items) {

    public record Item(String nombre, int cantidad, BigDecimal subtotal) {
    }
}
