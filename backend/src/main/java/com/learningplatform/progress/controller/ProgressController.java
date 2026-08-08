package com.learningplatform.progress.controller;

import com.learningplatform.progress.dto.DashboardStatsResponse;
import com.learningplatform.progress.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * REST controller for user dashboard metrics and lesson completion tracking.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    /**
     * Fetches real-time dashboard statistics, progress bars, and achievement badges
     * for the authenticated caller.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Principal principal) {
        return ResponseEntity.ok(progressService.getDashboardStats(principal.getName()));
    }

    /**
     * Toggles completion state for a given lesson in a course.
     */
    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<Map<String, Object>> toggleLessonCompletion(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            Principal principal) {
        progressService.markLessonComplete(courseId, lessonId, principal.getName());
        return ResponseEntity.ok(Map.of(
                "lessonId", lessonId,
                "courseId", courseId
        ));
    }

}
