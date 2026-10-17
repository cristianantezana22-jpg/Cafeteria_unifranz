package com.cafeteria.cafeteria_unifranz.application.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String name,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal) {
}
