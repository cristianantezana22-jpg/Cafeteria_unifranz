package com.cafeteria.cafeteria_unifranz.application.dto;

import java.math.BigDecimal;

public record MenuProductResponse(
        Integer id,
        String name,
        String description,
        BigDecimal price,
        String category,
        Integer categoryId,
        String imageUrl,
        boolean featured) {
}
