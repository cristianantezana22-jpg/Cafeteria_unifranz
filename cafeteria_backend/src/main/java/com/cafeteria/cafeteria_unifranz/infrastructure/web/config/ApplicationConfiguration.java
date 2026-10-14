package com.cafeteria.cafeteria_unifranz.infrastructure.web.config;

import com.cafeteria.cafeteria_unifranz.application.service.AuthenticateCustomer;
import com.cafeteria.cafeteria_unifranz.application.service.GetFeaturedProducts;
import com.cafeteria.cafeteria_unifranz.application.service.PlaceOrder;
import com.cafeteria.cafeteria_unifranz.application.port.out.CustomerRepository;
import com.cafeteria.cafeteria_unifranz.application.port.out.OrderRepository;
import com.cafeteria.cafeteria_unifranz.application.port.out.ProductRepository;
import com.cafeteria.cafeteria_unifranz.application.service.impl.CustomerAuthenticationService;
import com.cafeteria.cafeteria_unifranz.application.service.impl.FeaturedProductService;
import com.cafeteria.cafeteria_unifranz.application.service.impl.OrderPlacementService;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.InMemoryCustomerRepository;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.InMemoryOrderRepository;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.InMemoryProductRepository;
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
	OrderRepository orderRepository() {
		return new InMemoryOrderRepository();
	}

	@Bean
	AuthenticateCustomer authenticateCustomer(CustomerRepository customerRepository) {
		return new CustomerAuthenticationService(customerRepository);
	}

	@Bean
	GetFeaturedProducts getFeaturedProducts(ProductRepository productRepository) {
		return new FeaturedProductService(productRepository);
	}

	@Bean
	PlaceOrder placeOrder(ProductRepository productRepository, OrderRepository orderRepository) {
		return new OrderPlacementService(productRepository, orderRepository);
	}
}