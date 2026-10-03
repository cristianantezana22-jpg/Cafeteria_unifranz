package com.cafeteria.cafeteria_unifranz.infrastructure.persistence.mapper;

import com.cafeteria.cafeteria_unifranz.domain.model.Producto;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.entity.ProductoEntity;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public Producto toDomain(ProductoEntity entity) {
        return new Producto(
                entity.getId(),
                entity.getNombre(),
                entity.getPrecio(),
                entity.getImagenUrl(),
                entity.getCategoria().getId()
        );
    }
}