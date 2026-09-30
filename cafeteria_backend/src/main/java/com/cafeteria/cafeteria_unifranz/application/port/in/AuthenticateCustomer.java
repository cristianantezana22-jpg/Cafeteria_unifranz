package com.cafeteria.cafeteria_unifranz.application.port.in;

import com.cafeteria.cafeteria_unifranz.domain.Customer;
import java.util.Optional;

public interface AuthenticateCustomer {
	Optional<Customer> authenticate(String email, String password);
}