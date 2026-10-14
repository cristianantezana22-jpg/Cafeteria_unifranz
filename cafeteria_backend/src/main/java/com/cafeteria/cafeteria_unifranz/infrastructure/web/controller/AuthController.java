package com.cafeteria.cafeteria_unifranz.infrastructure.web.controller;

import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;
import com.cafeteria.cafeteria_unifranz.application.service.AuthenticateCustomer;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private static final String DEMO_TOKEN = "demo-session-token";
	private final AuthenticateCustomer authenticateCustomer;

	public AuthController(AuthenticateCustomer authenticateCustomer) {
		this.authenticateCustomer = authenticateCustomer;
	}

	@PostMapping("/login")
	public LoginResponse login(@RequestBody LoginRequest request) {
		Optional<Customer> customer = authenticateCustomer.authenticate(request.email(), request.password());
		return customer.map(value -> new LoginResponse(DEMO_TOKEN, value))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));
	}
}