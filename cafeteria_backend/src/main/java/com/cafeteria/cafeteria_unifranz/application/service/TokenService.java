package com.cafeteria.cafeteria_unifranz.application.service;

import java.util.Optional;

import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;

public interface TokenService {

    String generate(AuthenticatedUser user);

    Optional<AuthenticatedUser> parse(String token);
}
