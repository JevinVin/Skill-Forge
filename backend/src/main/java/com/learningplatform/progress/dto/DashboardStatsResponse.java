package com.learningplatform.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data transfer object containing dashboard metrics, course progress bars,
 * badges, and instructor summary stats.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private String userRole;
    private String fullName;

    // Student summary stats
    private long totalEnrolledCourses;
    private long totalCompletedLessons;
    private long totalQuizzesAttempted;
    private double averageQuizScore;

    // Detailed Course Progress
    private List<CourseProgressDto> courseProgresses;

    // Earned Achievement Badges
    private List<BadgeDto> badges;

    // Instructor summary stats (populated if user is INSTRUCTOR)
    private long instructorTotalCourses;
    private long instructorTotalLessons;
    private double instructorAvgQuizScore;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseProgressDto {
        private Long courseId;
        private String courseTitle;
        private String instructorName;
        private int totalLessons;
        private int completedLessons;
        private double progressPercentage;
        private boolean isCompleted;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BadgeDto {
        private String code;
        private String title;
        private String description;
        private String icon;
        private boolean earned;
    }
}
