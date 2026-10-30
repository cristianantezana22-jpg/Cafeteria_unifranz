package com.cafeteria.cafeteria_unifranz.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        Long customerId,
        String serviceMode,
        String paymentMethod,
        List<OrderItemResponse> items,
        BigDecimal totalAmount,
        LocalDateTime createdAt) {
}
