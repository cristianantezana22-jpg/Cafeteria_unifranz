package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository {

    Optional<Usuario> findActiveByEmail(String email);

    boolean existsByEmail(String email);

    Usuario save(Usuario usuario);

    List<Usuario> findAll();

    Optional<Usuario> findById(Integer id);

    void deleteById(Integer id);
}
