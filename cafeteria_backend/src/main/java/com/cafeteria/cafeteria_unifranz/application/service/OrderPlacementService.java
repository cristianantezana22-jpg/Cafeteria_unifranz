package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.port.in.PlaceOrder;
import com.cafeteria.cafeteria_unifranz.application.port.out.OrderRepository;
import com.cafeteria.cafeteria_unifranz.application.port.out.ProductRepository;
import com.cafeteria.cafeteria_unifranz.domain.CustomerOrder;
import com.cafeteria.cafeteria_unifranz.domain.OrderLine;
import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class OrderPlacementService implements PlaceOrder {
	private final ProductRepository productRepository;
	private final OrderRepository orderRepository;

	public OrderPlacementService(ProductRepository productRepository, OrderRepository orderRepository) {
		this.productRepository = productRepository;
		this.orderRepository = orderRepository;
	}

	@Override
	public CustomerOrder placeOrder(String customerId, List<Item> items) {
		if (items == null || items.isEmpty()) {
			throw new IllegalArgumentException("El carrito está vacío");
		}

		List<OrderLine> lines = items.stream().map(item -> {
			if (item == null || item.quantity() < 1) {
				throw new IllegalArgumentException("La cantidad de cada producto debe ser mayor a cero");
			}

			Product product = productRepository.findById(item.productId())
					.orElseThrow(() -> new IllegalArgumentException("Uno de los productos ya no está disponible"));
			BigDecimal subtotal = product.price().multiply(BigDecimal.valueOf(item.quantity()));
			return new OrderLine(product.id(), product.name(), product.price(), item.quantity(), subtotal);
		}).toList();

		BigDecimal total = lines.stream()
				.map(OrderLine::subtotal)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		CustomerOrder order = new CustomerOrder(
				UUID.randomUUID().toString(),
				customerId,
				lines,
				total,
				Instant.now()
		);
		return orderRepository.save(order);
	}
}
