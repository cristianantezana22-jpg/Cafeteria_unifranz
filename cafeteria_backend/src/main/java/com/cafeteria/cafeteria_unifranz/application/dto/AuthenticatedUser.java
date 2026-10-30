package com.cafeteria.cafeteria_unifranz.application.dto;

import com.cafeteria.cafeteria_unifranz.Domain.UserRole;

/** Datos mínimos que viajan dentro del token. */
public record AuthenticatedUser(Integer id, String email, UserRole role) {
}
