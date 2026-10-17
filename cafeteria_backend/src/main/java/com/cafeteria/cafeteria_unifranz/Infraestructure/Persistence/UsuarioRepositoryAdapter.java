package com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.cafeteria.cafeteria_unifranz.Domain.Usuario;
import com.cafeteria.cafeteria_unifranz.Domain.UsuarioRepository;

@Repository
public class UsuarioRepositoryAdapter implements UsuarioRepository {

    private final UsuarioJpaRepository jpaRepository;

    public UsuarioRepositoryAdapter(UsuarioJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<Usuario> findActiveByEmail(String email) {
        return jpaRepository.findByEmailIgnoreCaseAndEliminadoCuandoIsNull(email)
                .map(this::toDomain);
    }

    private Usuario toDomain(UsuarioEntity entity) {
        return new Usuario(
                entity.getId(),
                entity.getNombreCompleto(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getRol());
    }
}
