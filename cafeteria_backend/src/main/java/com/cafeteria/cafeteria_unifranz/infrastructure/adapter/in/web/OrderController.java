package com.cafeteria.cafeteria_unifranz.infrastructure.adapter.in.web;

import com.cafeteria.cafeteria_unifranz.application.port.in.PlaceOrder;
import com.cafeteria.cafeteria_unifranz.domain.CustomerOrder;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
	private static final String DEMO_TOKEN = "demo-session-token";
	private static final String DEMO_CUSTOMER_ID = "customer-1";
	private final PlaceOrder placeOrder;

	public OrderController(PlaceOrder placeOrder) {
		this.placeOrder = placeOrder;
	}

	@PostMapping
	public CustomerOrder createOrder(
			@RequestHeader(value = "Authorization", required = false) String authorization,
			@RequestBody OrderRequest request
	) {
		if (!DEMO_TOKEN.equals(authorization)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para realizar un pedido");
		}

		try {
			return placeOrder.placeOrder(DEMO_CUSTOMER_ID, request == null ? null : request.items());
		} catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
		}
	}

	public record OrderRequest(List<PlaceOrder.Item> items) {
	}
}
