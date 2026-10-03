package com.cafeteria.cafeteria_unifranz.presentation.dto;

import java.math.BigDecimal;

public record ProductoResponseDTO(
        Long id,
        String nombre,
        BigDecimal precio,
        String imagenUrl,
        Long categoriaId
) {
}