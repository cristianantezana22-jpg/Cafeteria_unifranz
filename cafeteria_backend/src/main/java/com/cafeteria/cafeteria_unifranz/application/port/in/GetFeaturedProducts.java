package com.cafeteria.cafeteria_unifranz.application.port.in;

import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.util.List;

public interface GetFeaturedProducts {
	List<Product> getFeaturedProducts();
}