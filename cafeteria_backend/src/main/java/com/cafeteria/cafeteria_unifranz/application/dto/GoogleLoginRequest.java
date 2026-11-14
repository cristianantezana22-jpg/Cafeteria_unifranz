package com.cafeteria.cafeteria_unifranz.application.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank(message = "La credencial de Google es obligatoria.")
        String credential) {
}
