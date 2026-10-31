package com.cafeteria.cafeteria_unifranz.application.dto;

import jakarta.validation.constraints.NotNull;

public record ProductAvailabilityRequest(@NotNull Boolean available) {
}