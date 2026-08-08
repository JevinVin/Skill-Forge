package com.learningplatform.progress.service;

import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.model.CourseModule;
import com.learningplatform.course.model.Lesson;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.course.repository.LessonRepository;
import com.learningplatform.progress.dto.CourseProgressDetailResponse;
import com.learningplatform.progress.dto.DashboardStatsResponse;
import com.learningplatform.progress.dto.DashboardStatsResponse.BadgeDto;
import com.learningplatform.progress.dto.DashboardStatsResponse.CourseProgressDto;

import com.learningplatform.progress.model.Progress;
import com.learningplatform.progress.repository.ProgressRepository;
import com.learningplatform.quiz.model.Quiz;
import com.learningplatform.quiz.model.QuizSubmission;
import com.learningplatform.quiz.repository.QuizRepository;
import com.learningplatform.quiz.repository.QuizSubmissionRepository;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service handling learning progress tracking, dashboard stats calculation,
 * weighted quiz/lesson progress contributions, and permanent progress persistence.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final QuizRepository quizRepository;

    /**
     * Permanently marks a lesson as completed for the authenticated user.
     * Progress is permanent — it cannot be undone or reverted once completed.
     */
    @Transactional
    public void markLessonComplete(Long courseId, Long lessonId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        Optional<Progress> existing = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId);

        if (existing.isPresent()) {
            log.info("Lesson {} already permanently completed by user {}", lessonId, userEmail);
        } else {
            Progress progress = Progress.builder()
                    .user(user)
                    .course(course)
                    .lesson(lesson)
                    .build();
            progressRepository.save(progress);
            log.info("Lesson {} permanently marked complete by user {}", lessonId, userEmail);
        }
    }

    /**
     * Retrieves full course progress details including completed lesson IDs,
     * completed module quiz IDs, and weighted progress contribution (lessons + quizzes).
     */
    @Transactional(readOnly = true)
    public CourseProgressDetailResponse getCourseProgressDetails(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        List<Progress> userProgresses = progressRepository.findByUserIdAndCourseId(user.getId(), courseId);
        List<Long> completedLessonIds = userProgresses.stream()
                .map(p -> p.getLesson().getId())
                .distinct()
                .toList();

        List<Long> completedModuleIds = new ArrayList<>();
        int totalQuizzesCount = 0;
        int completedQuizzesCount = 0;

        List<QuizSubmission> submissions = quizSubmissionRepository.findByStudentId(user.getId());

        if (course.getModules() != null) {
            for (CourseModule mod : course.getModules()) {
                if (isModuleCompleted(mod.getId(), user.getId())) {
                    completedModuleIds.add(mod.getId());
                }

                Optional<Quiz> modQuiz = quizRepository.findByModuleIdWithDetails(mod.getId());
                if (modQuiz.isPresent()) {
                    totalQuizzesCount++;
                    boolean passed = submissions.stream()
                            .filter(s -> s.getQuiz() != null && s.getQuiz().getId().equals(modQuiz.get().getId()))
                            .anyMatch(s -> s.getPercentage() >= 100.0);
                    if (passed) {
                        completedQuizzesCount++;
                    }
                }
            }
        }

        int totalLessonsCount = course.getModules() != null
                ? course.getModules().stream().mapToInt(m -> m.getLessons() != null ? m.getLessons().size() : 0).sum()
                : 0;
        int completedLessonsCount = completedLessonIds.size();

        int totalItemsCount = totalLessonsCount + totalQuizzesCount;
        int completedItemsCount = completedLessonsCount + completedQuizzesCount;

        int overallPercentage = totalItemsCount > 0
                ? (int) Math.round(((double) completedItemsCount / totalItemsCount) * 100.0)
                : 0;

        return CourseProgressDetailResponse.builder()
                .courseId(courseId)
                .completedLessonIds(completedLessonIds)
                .completedModuleIds(completedModuleIds)
                .totalLessonsCount(totalLessonsCount)
                .completedLessonsCount(completedLessonsCount)
                .totalQuizzesCount(totalQuizzesCount)
                .completedQuizzesCount(completedQuizzesCount)
                .totalItemsCount(totalItemsCount)
                .completedItemsCount(completedItemsCount)
                .overallProgressPercentage(overallPercentage)
                .build();
    }

    /**
     * Calculates statistics and badges for the student's dashboard.
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        List<Course> allCourses = courseRepository.findAll();
        List<Progress> userProgresses = progressRepository.findByUserId(user.getId());
        List<QuizSubmission> quizSubmissions = quizSubmissionRepository.findByStudentId(user.getId());

        long totalCompletedLessons = userProgresses.size();
        long totalQuizzesAttempted = quizSubmissions.size();
        double averageQuizScore = quizSubmissions.isEmpty() ? 0.0 :
                quizSubmissions.stream().mapToDouble(QuizSubmission::getPercentage).average().orElse(0.0);

        List<CourseProgressDto> courseProgressList = new ArrayList<>();
        boolean hasCompletedCourse = false;

        for (Course course : allCourses) {
            int totalLessons = course.getModules().stream()
                    .mapToInt(m -> m.getLessons().size())
                    .sum();

            if (totalLessons == 0) continue;

            long completedInCourse = userProgresses.stream()
                    .filter(p -> p.getCourse().getId().equals(course.getId()))
                    .count();

            double pct = ((double) completedInCourse / totalLessons) * 100.0;
            if (pct >= 100.0) hasCompletedCourse = true;

            courseProgressList.add(CourseProgressDto.builder()
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .completedLessons((int) completedInCourse)
                    .totalLessons(totalLessons)
                    .progressPercentage(Math.round(pct * 10.0) / 10.0)
                    .build());

        }

        List<BadgeDto> badges = new ArrayList<>();

        badges.add(BadgeDto.builder()
                .code("FIRST_STEPS")
                .title("First Steps")
                .description("Completed your first lesson")
                .icon("🚀")
                .earned(totalCompletedLessons > 0)
                .build());

        badges.add(BadgeDto.builder()
                .code("QUIZ_EXPLORER")
                .title("Quiz Explorer")
                .description("Submitted your first quiz")
                .icon("🎯")
                .earned(totalQuizzesAttempted > 0)
                .build());

        badges.add(BadgeDto.builder()
                .code("QUIZ_MASTER")
                .title("Quiz Master")
                .description("Scored 100% on any quiz")
                .icon("🏆")
                .earned(quizSubmissions.stream().anyMatch(s -> s.getPercentage() >= 100.0))
                .build());

        badges.add(BadgeDto.builder()
                .code("COURSE_GRADUATE")
                .title("Course Graduate")
                .description("Fully completed a course")
                .icon("🎓")
                .earned(hasCompletedCourse)
                .build());

        return DashboardStatsResponse.builder()
                .totalCompletedLessons((int) totalCompletedLessons)
                .totalQuizzesAttempted((int) totalQuizzesAttempted)
                .averageQuizScore(Math.round(averageQuizScore * 10.0) / 10.0)
                .courseProgresses(courseProgressList)
                .badges(badges)
                .build();
    }

    /**
     * Checks if a specific module is completed by a student.
     * Rule: All lessons completed AND (no module quiz OR best module quiz score == 100.0%).
     */
    @Transactional(readOnly = true)
    public boolean isModuleCompleted(Long moduleId, Long userId) {
        CourseModule module = courseRepository.findAll().stream()
                .flatMap(c -> c.getModules().stream())
                .filter(m -> m.getId().equals(moduleId))
                .findFirst()
                .orElse(null);

        if (module == null || module.getLessons().isEmpty()) return false;

        List<Progress> userProgresses = progressRepository.findByUserId(userId);
        long completedLessons = module.getLessons().stream()
                .filter(lesson -> userProgresses.stream().anyMatch(p -> p.getLesson().getId().equals(lesson.getId())))
                .count();

        boolean allLessonsDone = completedLessons == module.getLessons().size();
        if (!allLessonsDone) return false;

        Optional<Quiz> moduleQuizOpt = quizRepository.findByModuleIdWithDetails(moduleId);
        if (moduleQuizOpt.isEmpty()) return true;

        Quiz moduleQuiz = moduleQuizOpt.get();
        List<QuizSubmission> submissions = quizSubmissionRepository.findByStudentId(userId);

        boolean hasPerfectScore = submissions.stream()
                .filter(s -> s.getQuiz() != null && s.getQuiz().getId().equals(moduleQuiz.getId()))
                .anyMatch(s -> s.getPercentage() >= 100.0);

        return hasPerfectScore;
    }
}
