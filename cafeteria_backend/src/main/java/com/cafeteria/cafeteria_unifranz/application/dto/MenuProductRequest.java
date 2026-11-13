package com.cafeteria.cafeteria_unifranz.application.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MenuProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull @Positive Integer categoryId,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        boolean featured) {
}
