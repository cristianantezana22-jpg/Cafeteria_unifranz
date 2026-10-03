package com.cafeteria.cafeteria_unifranz.application.port.out;

import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.util.List;
import java.util.Optional;

public interface ProductRepository {
	List<Product> findFeaturedProducts();
	Optional<Product> findById(String id);
}