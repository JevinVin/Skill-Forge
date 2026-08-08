package com.learningplatform.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Detailed progress state for a specific course including lesson IDs,
 * module quiz completions, and weighted progress contribution.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressDetailResponse {

    private Long courseId;
    private List<Long> completedLessonIds;
    private List<Long> completedModuleIds;
    private int totalLessonsCount;
    private int completedLessonsCount;
    private int totalQuizzesCount;
    private int completedQuizzesCount;
    private int totalItemsCount; // totalLessons + totalQuizzes
    private int completedItemsCount; // completedLessons + completedQuizzes
    private int overallProgressPercentage; // weighted percentage
}
