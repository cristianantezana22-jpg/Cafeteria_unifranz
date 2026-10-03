package com.cafeteria.cafeteria_unifranz.infrastructure.persistence.repository;

import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.entity.ProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoJpaRepository extends JpaRepository<ProductoEntity, Long> {
    List<ProductoEntity> findByCategoriaId(Long categoriaId);
}