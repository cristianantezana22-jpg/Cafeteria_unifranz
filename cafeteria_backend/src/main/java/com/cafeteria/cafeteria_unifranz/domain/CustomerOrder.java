package com.cafeteria.cafeteria_unifranz.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CustomerOrder(
		String id,
		String customerId,
		List<OrderLine> items,
		BigDecimal total,
		Instant createdAt
) {
	public CustomerOrder {
		items = List.copyOf(items);
	}
}
