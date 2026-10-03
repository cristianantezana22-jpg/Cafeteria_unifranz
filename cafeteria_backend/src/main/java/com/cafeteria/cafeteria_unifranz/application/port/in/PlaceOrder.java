package com.cafeteria.cafeteria_unifranz.application.port.in;

import com.cafeteria.cafeteria_unifranz.domain.CustomerOrder;
import java.util.List;

public interface PlaceOrder {
	CustomerOrder placeOrder(String customerId, List<Item> items);

	record Item(String productId, int quantity) {
	}
}
