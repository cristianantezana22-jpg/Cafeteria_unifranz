package com.cafeteria.cafeteria_unifranz.application.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateOrderRequest(
        @NotEmpty(message = "El pedido debe incluir al menos un producto.")
        List<@Valid CreateOrderItemRequest> items,
        String serviceMode,
        String paymentMethod,
        @PositiveOrZero(message = "El total no puede ser negativo.")
        BigDecimal totalAmount) {
}
