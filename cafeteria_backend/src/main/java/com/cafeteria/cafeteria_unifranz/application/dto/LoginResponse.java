package com.cafeteria.cafeteria_unifranz.application.dto;

/**
 * Misma forma que CustomerSession del frontend:
 * { token, customer: { id, name, email }, role }
 */
public record LoginResponse(String token, Customer customer, String role) {

    public record Customer(String id, String name, String email) {
    }
}
