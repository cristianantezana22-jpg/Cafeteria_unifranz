package com.cafeteria.cafeteria_unifranz.application.dto;

import com.cafeteria.cafeteria_unifranz.domain.Customer;

public record LoginResponse(String token, Customer customer) {
}
