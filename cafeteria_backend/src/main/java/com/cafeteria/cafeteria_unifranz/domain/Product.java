package com.cafeteria.cafeteria_unifranz.domain;

import java.math.BigDecimal;

public record Product(
		String id,
		String name,
		String description,
		BigDecimal price,
		String category,
		String imageUrl,
		boolean featured
) {
}