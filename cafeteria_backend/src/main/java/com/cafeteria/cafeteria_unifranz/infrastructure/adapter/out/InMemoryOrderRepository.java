package com.cafeteria.cafeteria_unifranz.infrastructure.adapter.out;

import com.cafeteria.cafeteria_unifranz.application.port.out.OrderRepository;
import com.cafeteria.cafeteria_unifranz.domain.CustomerOrder;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class InMemoryOrderRepository implements OrderRepository {
	private final ConcurrentMap<String, CustomerOrder> orders = new ConcurrentHashMap<>();

	@Override
	public CustomerOrder save(CustomerOrder order) {
		orders.put(order.id(), order);
		return order;
	}
}
