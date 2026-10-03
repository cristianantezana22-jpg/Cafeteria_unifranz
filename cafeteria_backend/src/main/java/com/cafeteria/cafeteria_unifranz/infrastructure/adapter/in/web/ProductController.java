package com.cafeteria.cafeteria_unifranz.infrastructure.adapter.in.web;

import com.cafeteria.cafeteria_unifranz.application.port.in.GetFeaturedProducts;
import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/products")
public class ProductController {
	private static final String DEMO_TOKEN = "demo-session-token";
	private final GetFeaturedProducts getFeaturedProducts;

	public ProductController(GetFeaturedProducts getFeaturedProducts) {
		this.getFeaturedProducts = getFeaturedProducts;
	}

	@GetMapping("/featured")
	public List<Product> featuredProducts(@RequestHeader(value = "Authorization", required = false) String authorization) {
		if (!DEMO_TOKEN.equals(authorization)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para ver los productos");
		}
		return getFeaturedProducts.getFeaturedProducts();
	}
}