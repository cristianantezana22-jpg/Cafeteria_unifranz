package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductJpaRepository extends JpaRepository<ProductEntity, Long> {
}
