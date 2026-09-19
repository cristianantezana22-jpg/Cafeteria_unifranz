package com.cafeteria.cafeteria_unifranz.domain.model;

import java.math.BigDecimal;

public record Producto(
        Long id,
        String nombre,
        BigDecimal precio,
        String imagenUrl,
        Long categoriaId
) {
}