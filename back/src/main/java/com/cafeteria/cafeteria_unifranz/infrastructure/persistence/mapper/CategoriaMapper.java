package com.cafeteria.cafeteria_unifranz.infrastructure.persistence.mapper;

import com.cafeteria.cafeteria_unifranz.domain.model.Categoria;
import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.entity.CategoriaEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {

    public Categoria toDomain(CategoriaEntity entity) {
        return new Categoria(entity.getId(), entity.getNombre());
    }
}