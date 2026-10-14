package com.cafeteria.cafeteria_unifranz.application.port.out;

import com.cafeteria.cafeteria_unifranz.domain.CustomerOrder;

public interface OrderRepository {
	CustomerOrder save(CustomerOrder order);
}
