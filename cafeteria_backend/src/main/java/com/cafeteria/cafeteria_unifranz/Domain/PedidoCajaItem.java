package com.cafeteria.cafeteria_unifranz.Domain;

import java.math.BigDecimal;

public record PedidoCajaItem(String nombre, int cantidad, BigDecimal subtotal) {
}
