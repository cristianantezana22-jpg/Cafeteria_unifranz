package com.cafeteria.cafeteria_unifranz.infrastructure.adapter.out;

import com.cafeteria.cafeteria_unifranz.application.port.out.CustomerRepository;
import com.cafeteria.cafeteria_unifranz.domain.Customer;
import java.util.Optional;

public class InMemoryCustomerRepository implements CustomerRepository {
	private static final String DEMO_EMAIL = "cliente@cafeteria.com";
	private static final String DEMO_PASSWORD = "cafe123";
	private static final Customer DEMO_CUSTOMER = new Customer("customer-1", "Alex Rivera", DEMO_EMAIL);

	@Override
	public Optional<Customer> authenticate(String email, String password) {
		if (DEMO_EMAIL.equalsIgnoreCase(email) && DEMO_PASSWORD.equals(password)) {
			return Optional.of(DEMO_CUSTOMER);
		}
		return Optional.empty();
	}
}