package com.cafeteria.cafeteria_unifranz.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record CreateOrderItemRequest(
        @NotBlank(message = "El identificador del producto es obligatorio.")
        String productId,
        @Positive(message = "La cantidad debe ser mayor que cero.")
        int quantity) {
}
