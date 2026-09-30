package com.cafeteria.cafeteria_unifranz.application.service;

import com.cafeteria.cafeteria_unifranz.application.port.in.GetFeaturedProducts;
import com.cafeteria.cafeteria_unifranz.application.port.out.ProductRepository;
import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.util.List;

public class FeaturedProductService implements GetFeaturedProducts {
	private final ProductRepository productRepository;

	public FeaturedProductService(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Override
	public List<Product> getFeaturedProducts() {
		return productRepository.findFeaturedProducts();
	}
}