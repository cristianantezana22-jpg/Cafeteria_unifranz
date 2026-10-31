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
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.cafeteria.cafeteria_unifranz.application.dto.ProductAvailabilityResponse;

@Service
public class CatalogService {

    private final CategoryJpaRepository categories;
    private final ProductJpaRepository products;
    private final NotificadorTiempoReal notificador;

    public CatalogService(
        CategoryJpaRepository categories,
        ProductJpaRepository products,
        NotificadorTiempoReal notificador) {
    this.categories = categories;
    this.products = products;
    this.notificador = notificador;
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
    @Transactional
    public ProductAvailabilityResponse changeAvailability(Long id, boolean available, String modifiedBy) {
    ProductEntity product = products.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el producto."));
    product.changeAvailability(available, modifiedBy);
    notificador.productosActualizados(id.intValue());
    return new ProductAvailabilityResponse(product.getId(), product.isAvailable());
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
                toResponse(product.getCategory()),
                product.isAvailable());
    }
}