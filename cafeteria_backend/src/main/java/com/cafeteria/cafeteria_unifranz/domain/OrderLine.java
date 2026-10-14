package com.cafeteria.cafeteria_unifranz.domain;

import java.math.BigDecimal;

public record OrderLine(
		String productId,
		String name,
		BigDecimal unitPrice,
		int quantity,
		BigDecimal subtotal
) {
}
