package com.learningplatform.auth.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility class for generating and validating JSON Web Tokens.
 *
 * <p>Uses the JJWT 0.12.x API (which changed substantially from 0.9.x).
 * The signing key is derived from the {@code jwt.secret} property — it must be
 * at least 32 characters (256 bits) to satisfy HS256.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Derives the HMAC-SHA256 signing key from the configured secret string.
     * The raw UTF-8 bytes of the secret are used directly (no Base64 encoding required).
     *
     * @return a {@link SecretKey} suitable for HS256 signing
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a signed JWT for the given user.
     *
     * @param email the user's email address (stored as the JWT subject)
     * @param role  the user's role name (e.g. "STUDENT"), stored as a custom claim
     * @return a compact, URL-safe JWT string
     */
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts the email address (subject) from a verified token.
     *
     * @param token a signed JWT string
     * @return the email stored as the token subject
     * @throws JwtException if the token is invalid or expired
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Checks whether a token is structurally valid and not expired.
     * Returns {@code false} (rather than throwing) so callers can branch cleanly.
     *
     * @param token the JWT string to validate
     * @return {@code true} if the token passes signature and expiry checks
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parses and verifies the token, returning the embedded claims.
     *
     * @param token the JWT string to parse
     * @return the {@link Claims} payload
     * @throws JwtException if the signature is invalid or the token is expired
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
