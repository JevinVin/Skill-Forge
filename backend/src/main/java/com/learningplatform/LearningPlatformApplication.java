package com.learningplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Learning Platform backend.
 * Wires Spring Boot auto-configuration and launches the embedded Tomcat server.
 * All feature logic lives in feature-specific packages (auth, course, quiz).
 */
@SpringBootApplication
public class LearningPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(LearningPlatformApplication.class, args);
    }
}
