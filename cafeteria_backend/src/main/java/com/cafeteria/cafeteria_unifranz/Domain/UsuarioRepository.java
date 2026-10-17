package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.Optional;

public interface UsuarioRepository {

    Optional<Usuario> findActiveByEmail(String email);
}
