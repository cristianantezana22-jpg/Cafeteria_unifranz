package com.cafeteria.cafeteria_unifranz.application.dto;

import com.cafeteria.cafeteria_unifranz.Domain.UserRole;

public record AuthenticatedUser(Integer id, String email, UserRole role) {
}
