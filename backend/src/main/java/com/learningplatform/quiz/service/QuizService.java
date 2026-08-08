package com.learningplatform.quiz.service;

import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.quiz.dto.*;
import com.learningplatform.quiz.model.*;
import com.learningplatform.quiz.repository.QuizRepository;
import com.learningplatform.quiz.repository.QuizSubmissionRepository;
import com.learningplatform.shared.exception.ConflictException;
import com.learningplatform.shared.exception.ForbiddenException;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Business logic for quiz management and submission scoring.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Create a quiz for a course (INSTRUCTOR, one per course)</li>
 *   <li>Add questions with options to a quiz (INSTRUCTOR)</li>
 *   <li>Fetch a quiz with answers hidden (any authenticated user)</li>
 *   <li>Score a submission and persist the result (any authenticated user)</li>
 * </ul>
 *
 * <p>Ownership is verified by comparing the caller's email to the course instructor's email.
 * The caller's email is passed in from the controller — no SecurityContextHolder coupling.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final QuizImportService quizImportService;
    private final com.learningplatform.course.repository.CourseModuleRepository courseModuleRepository;



    // ── Instructor operations ────────────────────────────────────────────────

    /**
     * Creates a quiz for a course. Only the course's instructor can do this,
     * and each course may have at most one quiz.
     *
     * @param courseId        the course to attach the quiz to
     * @param request         quiz title and description
     * @param instructorEmail the authenticated caller's email
     * @return the created quiz as a {@link QuizResponse}
     * @throws ResourceNotFoundException if the course does not exist
     * @throws ForbiddenException        if the caller is not the course owner
     * @throws ConflictException         if the course already has a quiz
     */
    @Transactional
    public QuizResponse createQuiz(Long courseId, CreateQuizRequest request, String instructorEmail) {
        Course course = loadCourse(courseId);
        verifyInstructorOwnership(course, instructorEmail);

        if (quizRepository.existsByCourseId(courseId)) {
            throw new ConflictException("Course " + courseId + " already has a quiz");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .build();

        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz created for course {}: '{}'", courseId, saved.getTitle());
        return QuizResponse.from(saved);
    }

    /**
     * Adds a question (with all its options) to an existing quiz.
     * The question is appended after any existing questions.
     *
     * @param courseId        the course whose quiz receives the question
     * @param request         question text and a list of options (at least 2, max 6)
     * @param instructorEmail the authenticated caller's email
     * @return the updated quiz (all questions) as a {@link QuizResponse}
     * @throws ResourceNotFoundException if no quiz exists for the course
     * @throws ForbiddenException        if the caller is not the course owner
     */
    @Transactional
    public QuizResponse addQuestion(Long courseId, CreateQuestionRequest request, String instructorEmail) {
        Quiz quiz = loadQuizWithDetails(courseId);
        verifyInstructorOwnership(quiz.getCourse(), instructorEmail);

        int nextOrder = quiz.getQuestions().size();

        Question question = Question.builder()
                .text(request.getText())
                .orderIndex(nextOrder)
                .quiz(quiz)
                .build();

        // Build and associate options within the same transaction
        List<QuizOption> options = request.getOptions().stream()
                .map(opt -> QuizOption.builder()
                        .text(opt.getText())
                        .correct(opt.isCorrect())
                        .question(question)
                        .build())
                .collect(Collectors.toList());

        question.setOptions(options);
        quiz.getQuestions().add(question);

        // CascadeType.ALL on Quiz → Questions → Options persists the whole graph
        Quiz saved = quizRepository.save(quiz);
        log.info("Question added to quiz for course {}: '{}'", courseId, request.getText());
        return QuizResponse.from(saved);
    }

    /**
     * Deletes the quiz for a course. Restricted to the course INSTRUCTOR owner.
     *
     * @param courseId        the course ID
     * @param instructorEmail the authenticated caller's email
     * @throws ResourceNotFoundException if no quiz exists for the course
     * @throws ForbiddenException        if the caller is not the course owner
     */
    @Transactional
    public void deleteQuiz(Long courseId, String instructorEmail) {
        Quiz quiz = loadQuizWithDetails(courseId);
        verifyInstructorOwnership(quiz.getCourse(), instructorEmail);
        quizRepository.delete(quiz);
        log.info("Quiz deleted for course id: {}", courseId);
    }

    /**
     * Deletes a single question from a course quiz. Restricted to the course INSTRUCTOR owner.
     *
     * @param courseId        the course ID
     * @param questionId      the question ID to delete
     * @param instructorEmail the authenticated caller's email
     * @return the updated quiz
     */
    @Transactional
    public QuizResponse deleteQuestion(Long courseId, Long questionId, String instructorEmail) {
        Quiz quiz = loadQuizWithDetails(courseId);
        verifyInstructorOwnership(quiz.getCourse(), instructorEmail);

        boolean removed = quiz.getQuestions().removeIf(q -> q.getId().equals(questionId));
        if (!removed) {
            throw new ResourceNotFoundException("Question not found with id: " + questionId);
        }

        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            quiz.getQuestions().get(i).setOrderIndex(i);
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Question {} deleted from quiz for course {}", questionId, courseId);
        return QuizResponse.from(saved);
    }

    /**
     * Updates an existing question text and its options within a course quiz.
     * Restricted to the course INSTRUCTOR owner.
     *
     * @param courseId        the course ID
     * @param questionId      the question ID to update
     * @param request         updated question text and options list
     * @param instructorEmail the authenticated caller's email
     * @return the updated quiz
     */
    @Transactional
    public QuizResponse updateQuestion(Long courseId, Long questionId, CreateQuestionRequest request, String instructorEmail) {
        Quiz quiz = loadQuizWithDetails(courseId);
        verifyInstructorOwnership(quiz.getCourse(), instructorEmail);

        Question question = quiz.getQuestions().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        question.setText(request.getText());

        // Update options in-place to avoid Hibernate orphanRemoval collection replacement exception
        List<QuizOption> currentOptions = question.getOptions();
        List<com.learningplatform.quiz.dto.QuizOptionRequest> newOptionDtos = request.getOptions();

        for (int i = 0; i < newOptionDtos.size(); i++) {
            com.learningplatform.quiz.dto.QuizOptionRequest dto = newOptionDtos.get(i);
            if (i < currentOptions.size()) {
                QuizOption existing = currentOptions.get(i);
                existing.setText(dto.getText());
                existing.setCorrect(dto.isCorrect());
            } else {
                QuizOption newOpt = QuizOption.builder()
                        .text(dto.getText())
                        .correct(dto.isCorrect())
                        .question(question)
                        .build();
                currentOptions.add(newOpt);
            }
        }


        while (currentOptions.size() > newOptionDtos.size()) {
            currentOptions.remove(currentOptions.size() - 1);
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Question {} updated in quiz for course {}", questionId, courseId);
        return QuizResponse.from(saved);
    }

    /**
     * Imports questions in bulk from an uploaded CSV or JSON file.
     * Automatically creates a quiz container for the course if one does not exist yet.
     *
     * @param courseId        the course ID
     * @param file            the uploaded CSV or JSON file
     * @param instructorEmail the authenticated caller's email
     * @return the updated quiz with imported questions
     */
    @Transactional
    public QuizResponse importQuizQuestions(Long courseId, org.springframework.web.multipart.MultipartFile file, String instructorEmail) {
        Course course = loadCourse(courseId);
        verifyInstructorOwnership(course, instructorEmail);

        Quiz quiz = quizRepository.findByCourseIdWithDetails(courseId)
                .orElseGet(() -> {
                    Quiz newQuiz = Quiz.builder()
                            .title(course.getTitle() + " Quiz")
                            .description("Quiz for " + course.getTitle())
                            .course(course)
                            .questions(new ArrayList<>())
                            .build();
                    return quizRepository.save(newQuiz);
                });

        List<CreateQuestionRequest> parsedQuestions = quizImportService.parseImportFile(file);
        int currentOrder = quiz.getQuestions().size();

        for (CreateQuestionRequest req : parsedQuestions) {
            Question question = Question.builder()
                    .text(req.getText())
                    .orderIndex(currentOrder++)
                    .quiz(quiz)
                    .build();

            List<QuizOption> options = req.getOptions().stream()
                    .map(opt -> QuizOption.builder()
                            .text(opt.getText())
                            .correct(opt.isCorrect())
                            .question(question)
                            .build())
                    .collect(Collectors.toList());

            question.setOptions(options);
            quiz.getQuestions().add(question);
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Imported {} questions into quiz for course id {}", parsedQuestions.size(), courseId);
        return QuizResponse.from(saved);
    }

    // ── Module Quiz operations ───────────────────────────────────────────────

    @Transactional
    public QuizResponse createModuleQuiz(Long moduleId, CreateQuizRequest request, String instructorEmail) {
        com.learningplatform.course.model.CourseModule module = courseModuleRepository.findByIdWithCourseAndInstructor(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));
        verifyInstructorOwnership(module.getCourse(), instructorEmail);

        if (quizRepository.existsByModuleId(moduleId)) {
            throw new ConflictException("Module " + moduleId + " already has a quiz");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .module(module)
                .questions(new ArrayList<>())
                .build();

        Quiz saved = quizRepository.save(quiz);
        log.info("Module Quiz created for module {}: '{}'", moduleId, saved.getTitle());
        return QuizResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public QuizResponse getModuleQuiz(Long moduleId) {
        Quiz quiz = quizRepository.findByModuleIdWithDetails(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("No quiz found for module id: " + moduleId));
        return QuizResponse.from(quiz);
    }

    @Transactional
    public QuizResultResponse submitModuleQuiz(Long moduleId, SubmitQuizRequest request, String studentEmail) {
        Quiz quiz = quizRepository.findByModuleIdWithDetails(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("No quiz found for module id: " + moduleId));
        User student = loadUser(studentEmail);
        return scoreAndSaveQuiz(quiz, request, student);
    }

    @Transactional
    public QuizResponse addModuleQuestion(Long moduleId, CreateQuestionRequest request, String instructorEmail) {
        Quiz quiz = quizRepository.findByModuleIdWithDetails(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("No quiz found for module id: " + moduleId));
        verifyInstructorOwnership(quiz.getModule().getCourse(), instructorEmail);
        return appendQuestionToQuiz(quiz, request);
    }

    @Transactional
    public QuizResponse importModuleQuizQuestions(Long moduleId, org.springframework.web.multipart.MultipartFile file, String instructorEmail) {
        com.learningplatform.course.model.CourseModule module = courseModuleRepository.findByIdWithCourseAndInstructor(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));
        verifyInstructorOwnership(module.getCourse(), instructorEmail);

        Quiz quiz = quizRepository.findByModuleIdWithDetails(moduleId)
                .orElseGet(() -> {
                    Quiz newQuiz = Quiz.builder()
                            .title(module.getTitle() + " Quiz")
                            .description("Quiz for module: " + module.getTitle())
                            .module(module)
                            .questions(new ArrayList<>())
                            .build();
                    return quizRepository.save(newQuiz);
                });

        List<CreateQuestionRequest> parsedQuestions = quizImportService.parseImportFile(file);
        int currentOrder = quiz.getQuestions().size();

        for (CreateQuestionRequest req : parsedQuestions) {
            Question question = Question.builder()
                    .text(req.getText())
                    .orderIndex(currentOrder++)
                    .quiz(quiz)
                    .build();

            List<QuizOption> options = req.getOptions().stream()
                    .map(opt -> QuizOption.builder()
                            .text(opt.getText())
                            .correct(opt.isCorrect())
                            .question(question)
                            .build())
                    .collect(Collectors.toList());

            question.setOptions(options);
            quiz.getQuestions().add(question);
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Imported {} questions into quiz for module id {}", parsedQuestions.size(), moduleId);
        return QuizResponse.from(saved);
    }

    private QuizResponse appendQuestionToQuiz(Quiz quiz, CreateQuestionRequest request) {
        int nextOrder = quiz.getQuestions().size();

        Question question = Question.builder()
                .text(request.getText())
                .orderIndex(nextOrder)
                .quiz(quiz)
                .build();

        List<QuizOption> options = request.getOptions().stream()
                .map(opt -> QuizOption.builder()
                        .text(opt.getText())
                        .correct(opt.isCorrect())
                        .question(question)
                        .build())
                .collect(Collectors.toList());

        question.setOptions(options);
        quiz.getQuestions().add(question);

        Quiz saved = quizRepository.save(quiz);
        return QuizResponse.from(saved);
    }

    private QuizResultResponse scoreAndSaveQuiz(Quiz quiz, SubmitQuizRequest request, User student) {
        Map<Long, Long> answers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        int totalQuestions = quiz.getQuestions().size();
        int correctCount = 0;

        List<QuestionResultResponse> results = new ArrayList<>();

        for (Question question : quiz.getQuestions()) {
            Long selectedOptionId = answers.get(question.getId());

            QuizOption correctOption = question.getOptions().stream()
                    .filter(QuizOption::isCorrect)
                    .findFirst()
                    .orElse(null);

            QuizOption selectedOption = question.getOptions().stream()
                    .filter(opt -> opt.getId().equals(selectedOptionId))
                    .findFirst()
                    .orElse(null);

            boolean isCorrect = selectedOption != null && correctOption != null && selectedOption.getId().equals(correctOption.getId());
            if (isCorrect) correctCount++;

            results.add(QuestionResultResponse.builder()
                    .questionId(question.getId())
                    .questionText(question.getText())
                    .selectedOptionId(selectedOptionId)
                    .selectedOptionText(selectedOption != null ? selectedOption.getText() : null)
                    .correctOptionId(correctOption != null ? correctOption.getId() : null)
                    .correctOptionText(correctOption != null ? correctOption.getText() : null)
                    .correct(isCorrect)
                    .build());
        }


        double percentage = totalQuestions > 0 ? ((double) correctCount / totalQuestions) * 100.0 : 0.0;

        QuizSubmission submission = QuizSubmission.builder()
                .quiz(quiz)
                .student(student)
                .score(correctCount)
                .totalQuestions(totalQuestions)
                .percentage(percentage)
                .build();

        QuizSubmission saved = submissionRepository.save(submission);

        return QuizResultResponse.builder()
                .submissionId(saved.getId())
                .score(correctCount)
                .totalQuestions(totalQuestions)
                .percentage(percentage)
                .questionResults(results)
                .build();
    }







    // ── Student operations ───────────────────────────────────────────────────

    /**
     * Fetches the quiz for a course with correct flags hidden.
     *
     * @param courseId the course whose quiz to fetch
     * @return a {@link QuizResponse} safe for public consumption
     * @throws ResourceNotFoundException if no quiz exists for the course
     */
    @Transactional(readOnly = true)
    public QuizResponse getQuizByCourseId(Long courseId) {
        Quiz quiz = loadQuizWithDetails(courseId);
        return QuizResponse.from(quiz);
    }

    /**
     * Scores a quiz submission and persists the result.
     *
     * <p>Scoring algorithm:
     * <ol>
     *   <li>For each question in the quiz, look up the student's selected option ID.</li>
     *   <li>Find the correct option for that question.</li>
     *   <li>Award one point if the selected option equals the correct option.</li>
     *   <li>Unanswered questions (not in the answers map) score zero.</li>
     * </ol>
     *
     * @param courseId      the course whose quiz is being submitted
     * @param request       map of {@code questionId → selectedOptionId}
     * @param studentEmail  the authenticated student's email
     * @return a {@link QuizResultResponse} with score, percentage, and per-question breakdown
     * @throws ResourceNotFoundException if no quiz exists for the course or user not found
     */
    @Transactional
    public QuizResultResponse submitQuiz(Long courseId, SubmitQuizRequest request, String studentEmail) {
        Quiz quiz = loadQuizWithDetails(courseId);
        User student = loadUser(studentEmail);

        Map<Long, Long> answers = request.getAnswers(); // questionId → selectedOptionId

        int score = 0;
        List<QuestionResultResponse> questionResults = new ArrayList<>();

        for (Question question : quiz.getQuestions()) {
            Long selectedOptionId = answers.get(question.getId());

            // Find the designated correct option for this question
            QuizOption correctOption = question.getOptions().stream()
                    .filter(QuizOption::isCorrect)
                    .findFirst()
                    .orElse(null); // edge case: question has no correct option marked

            // Resolve the option the student actually selected (for its display text)
            QuizOption selectedOption = selectedOptionId != null
                    ? question.getOptions().stream()
                            .filter(o -> o.getId().equals(selectedOptionId))
                            .findFirst()
                            .orElse(null)
                    : null;

            boolean isCorrect = selectedOption != null
                    && correctOption != null
                    && selectedOption.getId().equals(correctOption.getId());

            if (isCorrect) {
                score++;
            }

            questionResults.add(QuestionResultResponse.builder()
                    .questionId(question.getId())
                    .questionText(question.getText())
                    .selectedOptionId(selectedOptionId)
                    .selectedOptionText(selectedOption != null ? selectedOption.getText() : null)
                    .correctOptionId(correctOption != null ? correctOption.getId() : null)
                    .correctOptionText(correctOption != null ? correctOption.getText() : null)
                    .correct(isCorrect)
                    .build());
        }

        int total = quiz.getQuestions().size();
        // Avoid division-by-zero for an empty quiz
        double percentage = total > 0 ? Math.round((score * 100.0 / total) * 100.0) / 100.0 : 0.0;

        QuizSubmission submission = QuizSubmission.builder()
                .quiz(quiz)
                .student(student)
                .score(score)
                .totalQuestions(total)
                .percentage(percentage)
                .build();

        QuizSubmission saved = submissionRepository.save(submission);
        log.info("Quiz submitted by {}: {}/{} ({}%)", studentEmail, score, total, percentage);

        return QuizResultResponse.builder()
                .submissionId(saved.getId())
                .score(score)
                .totalQuestions(total)
                .percentage(percentage)
                .questionResults(questionResults)
                .build();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Course loadCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));
    }

    private Quiz loadQuizWithDetails(Long courseId) {
        return quizRepository.findByCourseIdWithDetails(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No quiz found for course: " + courseId));
    }

    private User loadUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + email));
    }

    /**
     * Verifies that the caller is the course's owning instructor.
     *
     * @param course          the course to check
     * @param instructorEmail the caller's email
     * @throws ForbiddenException if the caller is not the owner or not an instructor
     */
    private void verifyInstructorOwnership(Course course, String instructorEmail) {
        if (course.getInstructor().getRole() != Role.INSTRUCTOR
                || !course.getInstructor().getEmail().equals(instructorEmail)) {
            throw new ForbiddenException(
                    "You are not authorised to manage the quiz for this course");
        }
    }
}
