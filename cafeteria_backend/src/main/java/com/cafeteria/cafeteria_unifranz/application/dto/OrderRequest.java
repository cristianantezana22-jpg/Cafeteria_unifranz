package com.cafeteria.cafeteria_unifranz.application.dto;

import com.cafeteria.cafeteria_unifranz.application.service.PlaceOrder;
import java.util.List;

public record OrderRequest(List<PlaceOrder.Item> items) {
}
