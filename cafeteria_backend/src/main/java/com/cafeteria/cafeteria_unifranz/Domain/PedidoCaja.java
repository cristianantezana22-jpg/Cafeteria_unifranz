package com.cafeteria.cafeteria_unifranz.Domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoCaja(
        Integer id,
        String ticket,
        EstadoPedido estado,
        String origen,
        String cliente,
        String metodoPago,
        String estadoPago,
        BigDecimal total,
        LocalDateTime creadoEn,
        boolean almuerzo,
        List<PedidoCajaItem> items) {
}
