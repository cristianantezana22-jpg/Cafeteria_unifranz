package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderJpaRepository extends JpaRepository<CustomerOrderEntity, Long> {
}
