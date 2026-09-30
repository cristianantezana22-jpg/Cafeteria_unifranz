package com.cafeteria.cafeteria_unifranz.application.port.out;

import com.cafeteria.cafeteria_unifranz.domain.Customer;
import java.util.Optional;

public interface CustomerRepository {
	Optional<Customer> authenticate(String email, String password);
}