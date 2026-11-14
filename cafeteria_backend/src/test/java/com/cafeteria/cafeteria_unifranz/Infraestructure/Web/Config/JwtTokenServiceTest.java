package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.cafeteria.cafeteria_unifranz.Domain.UserRole;
import com.cafeteria.cafeteria_unifranz.application.dto.AuthenticatedUser;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtTokenServiceTest {

    private static final String SECRET = "test-secret-with-at-least-32-bytes";

    @Test
    void cashierTokensExpireAfterThirtyDays() {
        assertExpiration(UserRole.CAJERO, Duration.ofDays(30));
    }

    @Test
    void otherTokensKeepTheirConfiguredExpiration() {
        assertExpiration(UserRole.CLIENTE, Duration.ofHours(8));
    }

    private void assertExpiration(UserRole role, Duration expectedExpiration) {
        JwtTokenService service = new JwtTokenService(SECRET, 480, 30);
        String token = service.generate(new AuthenticatedUser(1, "user@example.com", role));
        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Duration actualExpiration = Duration.between(
                Instant.ofEpochMilli(claims.getIssuedAt().getTime()),
                Instant.ofEpochMilli(claims.getExpiration().getTime()));

        assertEquals(expectedExpiration, actualExpiration);
    }
}
