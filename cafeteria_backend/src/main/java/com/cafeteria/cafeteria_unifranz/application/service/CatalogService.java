package com.cafeteria.cafeteria_unifranz.application.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.CategoryEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.CategoryJpaRepository;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductEntity;
import com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence.ProductJpaRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.CategoryResponse;
import com.cafeteria.cafeteria_unifranz.application.dto.ProductResponse;

@Service
public class CatalogService {

    private final CategoryJpaRepository categories;
    private final ProductJpaRepository products;

    public CatalogService(
            CategoryJpaRepository categories,
            ProductJpaRepository products) {
        this.categories = categories;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categories.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts() {
        return products.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(this::toResponse)
                .toList();
    }

    private CategoryResponse toResponse(CategoryEntity category) {
        return new CategoryResponse(category.getId(), category.getName());
    }

    private ProductResponse toResponse(ProductEntity product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                toResponse(product.getCategory()));
    }
}
