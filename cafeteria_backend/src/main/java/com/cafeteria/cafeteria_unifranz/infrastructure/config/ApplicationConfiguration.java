package com.cafeteria.cafeteria_unifranz.infrastructure.config;

import com.cafeteria.cafeteria_unifranz.application.port.in.AuthenticateCustomer;
import com.cafeteria.cafeteria_unifranz.application.port.in.GetFeaturedProducts;
import com.cafeteria.cafeteria_unifranz.application.port.out.CustomerRepository;
import com.cafeteria.cafeteria_unifranz.application.port.out.ProductRepository;
import com.cafeteria.cafeteria_unifranz.application.service.CustomerAuthenticationService;
import com.cafeteria.cafeteria_unifranz.application.service.FeaturedProductService;
import com.cafeteria.cafeteria_unifranz.infrastructure.adapter.out.InMemoryCustomerRepository;
import com.cafeteria.cafeteria_unifranz.infrastructure.adapter.out.InMemoryProductRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfiguration {
	@Bean
	CustomerRepository customerRepository() {
		return new InMemoryCustomerRepository();
	}

	@Bean
	ProductRepository productRepository() {
		return new InMemoryProductRepository();
	}

	@Bean
	AuthenticateCustomer authenticateCustomer(CustomerRepository customerRepository) {
		return new CustomerAuthenticationService(customerRepository);
	}

	@Bean
	GetFeaturedProducts getFeaturedProducts(ProductRepository productRepository) {
		return new FeaturedProductService(productRepository);
	}
}