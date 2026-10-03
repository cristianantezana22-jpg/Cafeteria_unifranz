package com.cafeteria.cafeteria_unifranz.infrastructure.persistence.repository;

import com.cafeteria.cafeteria_unifranz.infrastructure.persistence.entity.CategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaJpaRepository extends JpaRepository<CategoriaEntity, Long> {
}