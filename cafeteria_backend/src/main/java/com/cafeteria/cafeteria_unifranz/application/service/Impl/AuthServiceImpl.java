package com.cafeteria.cafeteria_unifranz.application.service.Impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cafeteria.cafeteria_unifranz.Domain.EmailAlreadyRegisteredException;
import com.cafeteria.cafeteria_unifranz.Domain.InvalidCredentialsException;
import com.cafeteria.cafeteria_unifranz.Domain.RoleNotAllowedException;
import com.cafeteria.cafeteria_unifranz.Domain.UserRole;
import com.cafeteria.cafeteria_unifranz.Domain.Usuario;
import com.cafeteria.cafeteria_unifranz.Domain.UsuarioRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CustomerRegistrationRequest;
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

        UserRole role = UserRole.fromDatabaseValue(usuario.rol())
                .orElseThrow(() -> new RoleNotAllowedException(usuario.rol()));

        return createLoginResponse(usuario, role);
    }

    @Override
    @Transactional
    public LoginResponse register(CustomerRegistrationRequest request) {
        String email = request.email().trim();
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException();
        }

        Usuario usuario = usuarioRepository.save(new Usuario(
                null,
                request.nombreCompleto().trim(),
                email,
                passwordEncoder.encode(request.password()),
                UserRole.CLIENTE.name()));
        return createLoginResponse(usuario, UserRole.CLIENTE);
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