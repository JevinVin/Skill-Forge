package com.learningplatform.shared.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health-check controller.
 *
 * <p>Used to verify that the Spring Boot application has started successfully
 * and is able to accept HTTP requests. Not a replacement for production-grade
 * health monitoring (e.g. Spring Actuator) — just a fast local dev sanity check.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Returns a simple OK response to confirm the server is running.
     *
     * @return 200 OK with {@code { "status": "ok", "service": "learning-platform-backend" }}
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "learning-platform-backend"
        ));
    }
}
