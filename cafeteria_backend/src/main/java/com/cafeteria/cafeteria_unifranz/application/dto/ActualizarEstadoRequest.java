package com.cafeteria.cafeteria_unifranz.application.dto;

import jakarta.validation.constraints.NotNull;

import com.cafeteria.cafeteria_unifranz.Domain.EstadoPedido;

public record ActualizarEstadoRequest(
        @NotNull(message = "El estado es obligatorio.")
        EstadoPedido estado) {
}
