package com.cafeteria.cafeteria_unifranz.application.service.Impl;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.cafeteria.cafeteria_unifranz.Domain.EmailAlreadyRegisteredException;
import com.cafeteria.cafeteria_unifranz.Domain.InvalidCredentialsException;
import com.cafeteria.cafeteria_unifranz.Domain.RoleNotAllowedException;
import com.cafeteria.cafeteria_unifranz.Domain.UserRole;
import com.cafeteria.cafeteria_unifranz.Domain.Usuario;
import com.cafeteria.cafeteria_unifranz.Domain.UsuarioRepository;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.dto.CustomerRegistrationRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.GoogleLoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginRequest;
import com.cafeteria.cafeteria_unifranz.application.dto.LoginResponse;
import com.cafeteria.cafeteria_unifranz.application.service.AuthService;
import com.cafeteria.cafeteria_unifranz.application.service.TokenService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           TokenService tokenService,
                           @Value("${app.google.client-id}") String googleClientId) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.googleIdTokenVerifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(List.of(googleClientId))
                .build();
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
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken googleIdToken;
        try {
            googleIdToken = googleIdTokenVerifier.verify(request.credential());
        } catch (GeneralSecurityException | IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo validar la cuenta de Google. Inténtalo nuevamente.",
                    ex);
        }

        if (googleIdToken == null
                || !Boolean.TRUE.equals(googleIdToken.getPayload().getEmailVerified())) {
            throw new InvalidCredentialsException();
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String claimedEmail = payload.getEmail();
        if (claimedEmail == null
                || claimedEmail.isBlank()
                || claimedEmail.length() > 150
                || !claimedEmail.contains("@")) {
            throw new InvalidCredentialsException();
        }
        String email = claimedEmail.trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository.findActiveByEmail(email).orElseGet(() -> {
            if (usuarioRepository.existsByEmail(email)) {
                throw new InvalidCredentialsException();
            }

            String name = payload.get("name") instanceof String googleName
                    ? googleName.trim()
                    : "";
            if (name.isBlank()) {
                name = email.substring(0, email.indexOf('@'));
            }
            if (name.length() > 120) {
                name = name.substring(0, 120);
            }

            byte[] randomPassword = new byte[32];
            secureRandom.nextBytes(randomPassword);
            String passwordHash = passwordEncoder.encode(
                    Base64.getUrlEncoder().withoutPadding().encodeToString(randomPassword));
            return usuarioRepository.save(new Usuario(
                    null, name, email, passwordHash, UserRole.CLIENTE.name()));
        });

        UserRole role = UserRole.fromDatabaseValue(usuario.rol())
                .orElseThrow(() -> new RoleNotAllowedException(usuario.rol()));
        if (role != UserRole.CLIENTE) {
            throw new RoleNotAllowedException(usuario.rol());
        }

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

    @Override
    @Transactional
    public LoginResponse loginKiosk() {
        String email = "pantalla@cafeteria.local";
        Usuario usuario = usuarioRepository.findActiveByEmail(email).orElseGet(() ->
                usuarioRepository.save(new Usuario(
                        null,
                        "Pantalla de pedidos",
                        email,
                        passwordEncoder.encode("pantalla"),
                        UserRole.PANTALLA.name())));
        UserRole role = UserRole.fromDatabaseValue(usuario.rol()).orElse(UserRole.PANTALLA);
        return createLoginResponse(usuario, role == UserRole.PANTALLA ? role : UserRole.PANTALLA);
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