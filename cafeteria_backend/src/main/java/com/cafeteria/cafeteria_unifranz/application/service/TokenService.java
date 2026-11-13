package com.cafeteria.cafeteria_unifranz.application.service;

import java.util.Optional;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;

/** Puerto para emitir y validar tokens; la implementación (JWT) vive en infraestructura. */
public interface TokenService {

    String generate(AuthenticatedUser user);

    /** Devuelve el usuario del token, o vacío si es inválido o expiró. */
    Optional<AuthenticatedUser> parse(String token);
}
