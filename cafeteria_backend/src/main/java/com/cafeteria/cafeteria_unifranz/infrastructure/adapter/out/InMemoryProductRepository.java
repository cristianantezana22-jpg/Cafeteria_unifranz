package com.cafeteria.cafeteria_unifranz.infrastructure.adapter.out;

import com.cafeteria.cafeteria_unifranz.application.port.out.ProductRepository;
import com.cafeteria.cafeteria_unifranz.domain.Product;
import java.math.BigDecimal;
import java.util.List;

public class InMemoryProductRepository implements ProductRepository {
	private static final List<Product> PRODUCTS = List.of(
			new Product("product-1", "Latte de la casa", "Espresso doble con leche cremosa y un toque de vainilla.", new BigDecimal("22.00"), "Café", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85", true),
			new Product("product-2", "Croissant de almendra", "Hojaldre dorado, relleno de crema de almendra.", new BigDecimal("18.00"), "Panadería", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85", true),
			new Product("product-3", "Cold brew cítrico", "Café de extracción lenta con notas frescas de naranja.", new BigDecimal("20.00"), "Fríos", "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85", true),
			new Product("product-4", "Tostada de temporada", "Pan artesanal con palta, tomate y hierbas frescas.", new BigDecimal("26.00"), "Desayunos", "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85", true)
	);

	@Override
	public List<Product> findFeaturedProducts() {
		return PRODUCTS.stream().filter(Product::featured).toList();
	}
}