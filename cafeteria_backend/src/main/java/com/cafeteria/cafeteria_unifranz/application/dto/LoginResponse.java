package com.cafeteria.cafeteria_unifranz.application.dto;

<<<<<<< HEAD
/**
 * Misma forma que CustomerSession del frontend:
 * { token, customer: { id, name, email }, role }
 */
public record LoginResponse(String token, Customer customer, String role) {

    public record Customer(String id, String name, String email) {
=======
public record LoginResponse(String token, User user, String role) {

    public record User(String id, String name, String email) {
>>>>>>> alan
    }
}
