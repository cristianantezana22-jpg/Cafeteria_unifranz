package com.cafeteria.cafeteria_unifranz.application.service.Impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cafeteria.cafeteria_unifranz.Domain.InvalidCredentialsException;
import com.cafeteria.cafeteria_unifranz.Domain.RoleNotAllowedException;
import com.cafeteria.cafeteria_unifranz.Domain.UserRole;
import com.cafeteria.cafeteria_unifranz.Domain.Usuario;
import com.cafeteria.cafeteria_unifranz.Domain.UsuarioRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;
import com.cafeteria.cafeteria_unifranz.application.service.AuthService;
import com.cafeteria.cafeteria_unifranz.application.service.TokenService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthServiceImpl(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findActiveByEmail(request.email().trim())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), usuario.passwordHash())) {
            throw new InvalidCredentialsException();
        }

        UserRole role;
        try {
            role = UserRole.valueOf(usuario.rol().trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new RoleNotAllowedException(usuario.rol());
        }
        if (role != UserRole.CAJERO) {
            throw new RoleNotAllowedException(usuario.rol());
        }

        return createLoginResponse(usuario, role);
    }

    private LoginResponse createLoginResponse(Usuario usuario, UserRole role) {
        String token = tokenService.generate(
                new AuthenticatedUser(usuario.id(), usuario.email(), role));
        return new LoginResponse(
                token,
                new LoginResponse.User(
                        String.valueOf(usuario.id()),
                        usuario.nombreCompleto(),
                        usuario.email()),
                role.name());
    }
}
