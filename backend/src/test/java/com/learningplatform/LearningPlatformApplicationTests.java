package com.learningplatform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test: verifies the Spring application context loads without errors.
 *
 * <p>Uses the {@code test} profile (application-test.yml) so the full context
 * starts against an H2 in-memory database — no running PostgreSQL or Docker required.
 */
@SpringBootTest
@ActiveProfiles("test")
class LearningPlatformApplicationTests {

    @Test
    void contextLoads() {
        // If the application context fails to start, this test fails,
        // surfacing misconfigured beans or missing properties early.
    }
}
