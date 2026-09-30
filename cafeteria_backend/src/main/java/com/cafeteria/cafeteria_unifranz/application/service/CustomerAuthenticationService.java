package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.port.in.AuthenticateCustomer;
import com.cafeteria.cafeteria_unifranz.application.port.out.CustomerRepository;
import com.cafeteria.cafeteria_unifranz.domain.Customer;
import java.util.Optional;

public class CustomerAuthenticationService implements AuthenticateCustomer {
	private final CustomerRepository customerRepository;

	public CustomerAuthenticationService(CustomerRepository customerRepository) {
		this.customerRepository = customerRepository;
	}

	@Override
	public Optional<Customer> authenticate(String email, String password) {
		return customerRepository.authenticate(email, password);
	}
}