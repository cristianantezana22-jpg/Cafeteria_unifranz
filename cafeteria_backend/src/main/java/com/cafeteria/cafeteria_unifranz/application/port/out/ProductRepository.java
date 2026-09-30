package com.cafeteria.cafeteria_unifranz.application.port.out;

import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.util.List;

public interface ProductRepository {
	List<Product> findFeaturedProducts();
}