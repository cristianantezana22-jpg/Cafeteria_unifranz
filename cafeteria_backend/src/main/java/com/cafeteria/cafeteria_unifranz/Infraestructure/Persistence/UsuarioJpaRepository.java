package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioJpaRepository extends JpaRepository<UsuarioEntity, Integer> {

    Optional<UsuarioEntity> findByEmailIgnoreCaseAndEliminadoCuandoIsNull(String email);

<<<<<<< HEAD
    boolean existsByEmailIgnoreCase(String email);
=======
>>>>>>> alan
}
