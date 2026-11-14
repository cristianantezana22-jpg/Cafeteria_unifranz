package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Config;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import com.cafeteria.cafeteria_unifranz.Domain.UserRole;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;
import com.cafeteria.cafeteria_unifranz.application.service.TokenService;

@Component
public class JwtTokenService implements TokenService {

    private final SecretKey key;
    private final Duration expiration;
    private final Duration cashierExpiration;

    public JwtTokenService(@Value("${app.jwt.secret}") String secret,
                           @Value("${app.jwt.expiration-minutes:480}") long expirationMinutes,
                           @Value("${app.jwt.cashier-expiration-days:30}") long cashierExpirationDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = Duration.ofMinutes(expirationMinutes);
        this.cashierExpiration = Duration.ofDays(cashierExpirationDays);
    }

    @Override
    public String generate(AuthenticatedUser user) {
        Instant now = Instant.now();
        Duration tokenExpiration = user.role() == UserRole.CAJERO ? cashierExpiration : expiration;
        return Jwts.builder()
                .subject(String.valueOf(user.id()))
                .claim("email", user.email())
                .claim("role", user.role().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(tokenExpiration)))
                .signWith(key)
                .compact();
    }

    @Override
    public Optional<AuthenticatedUser> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return UserRole.fromDatabaseValue(claims.get("role", String.class))
                    .map(role -> new AuthenticatedUser(
                            Integer.valueOf(claims.getSubject()),
                            claims.get("email", String.class),
                            role));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
