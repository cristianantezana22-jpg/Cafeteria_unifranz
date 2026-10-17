package com.cafeteria.cafeteria_unifranz.application.dto;

public record LoginResponse(String token, User user, String role) {

    public record User(String id, String name, String email) {
    }
}
