package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.Optional;

/** Puerto de salida: la capa de infraestructura lo implementa. */
public interface UsuarioRepository {

    /** Busca un usuario no eliminado (eliminado_cuando IS NULL) por correo. */
    Optional<Usuario> findActiveByEmail(String email);

}
