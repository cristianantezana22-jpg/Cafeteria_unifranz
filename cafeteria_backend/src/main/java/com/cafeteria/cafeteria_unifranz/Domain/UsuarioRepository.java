package com.cafeteria.cafeteria_unifranz.Domain;

import java.util.List;
import java.util.Optional;

/** Puerto de salida: la capa de infraestructura lo implementa. */
public interface UsuarioRepository {

    /** Busca un usuario no eliminado (eliminado_cuando IS NULL) por correo. */
    Optional<Usuario> findActiveByEmail(String email);

    boolean existsByEmail(String email);

    Usuario save(Usuario usuario);

    // === AGREGAMOS SOLO ESTOS MÉTODOS PARA EL MÓDULO ADMIN ===
    List<Usuario> findAll();

    Optional<Usuario> findById(Integer id);

    void deleteById(Integer id);
}
