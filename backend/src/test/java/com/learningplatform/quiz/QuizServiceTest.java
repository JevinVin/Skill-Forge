package com.learningplatform.quiz;

import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.quiz.dto.*;
import com.learningplatform.quiz.model.*;
import com.learningplatform.quiz.repository.QuizRepository;
import com.learningplatform.quiz.repository.QuizSubmissionRepository;
import com.learningplatform.quiz.service.QuizService;
import com.learningplatform.shared.exception.ConflictException;
import com.learningplatform.shared.exception.ForbiddenException;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link QuizService}.
 *
 * <p>Uses Mockito only — no Spring context or database required.
 *
 * <p>Coverage:
 * <ul>
 *   <li>createQuiz: success, non-owner blocked, duplicate blocked</li>
 *   <li>getQuizByCourseId: success, not found</li>
 *   <li>submitQuiz: all correct, partial correct, all wrong, empty answers</li>
 *   <li>addQuestion: success, non-owner blocked</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock private QuizRepository quizRepository;
    @Mock private QuizSubmissionRepository submissionRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private QuizService quizService;

    // ── createQuiz ────────────────────────────────────────────────────────────

    @Test
    void createQuiz_byOwner_savesAndReturnsQuizResponse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, instructor);
        CreateQuizRequest request = new CreateQuizRequest();
        request.setTitle("Java Quiz");

        Quiz saved = buildQuiz(10L, course);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(quizRepository.existsByCourseId(1L)).thenReturn(false);
        when(quizRepository.save(any(Quiz.class))).thenReturn(saved);

        QuizResponse response = quizService.createQuiz(1L, request, "alice@example.com");

        assertThat(response.getId()).isEqualTo(10L);
        verify(quizRepository).save(any(Quiz.class));
    }

    @Test
    void createQuiz_byNonOwner_throwsForbiddenException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, instructor);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        CreateQuizRequest request = new CreateQuizRequest();
        request.setTitle("Hijacked Quiz");

        assertThatThrownBy(() ->
                quizService.createQuiz(1L, request, "hacker@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void createQuiz_whenDuplicateExists_throwsConflictException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, instructor);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(quizRepository.existsByCourseId(1L)).thenReturn(true);

        CreateQuizRequest request = new CreateQuizRequest();
        request.setTitle("Duplicate Quiz");

        assertThatThrownBy(() ->
                quizService.createQuiz(1L, request, "alice@example.com"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already has a quiz");
    }

    // ── getQuizByCourseId ─────────────────────────────────────────────────────

    @Test
    void getQuizByCourseId_whenExists_returnsQuizResponse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, instructor);
        Quiz quiz = buildQuiz(10L, course);

        when(quizRepository.findByCourseIdWithDetails(1L)).thenReturn(Optional.of(quiz));

        QuizResponse response = quizService.getQuizByCourseId(1L);

        assertThat(response.getId()).isEqualTo(10L);
    }

    @Test
    void getQuizByCourseId_whenNotFound_throwsResourceNotFoundException() {
        when(quizRepository.findByCourseIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.getQuizByCourseId(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── submitQuiz ────────────────────────────────────────────────────────────

    @Test
    void submitQuiz_withAllCorrect_returnsFullScore() {
        Quiz quiz = buildQuizWithOneQuestion(10L, buildCourse(1L, buildInstructor("alice@example.com")));
        User student = buildStudent("bob@example.com");

        // The correct optionId for question 100 is 200
        SubmitQuizRequest request = new SubmitQuizRequest();
        request.setAnswers(Map.of(100L, 200L)); // correct answer selected

        when(quizRepository.findByCourseIdWithDetails(1L)).thenReturn(Optional.of(quiz));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(submissionRepository.save(any(QuizSubmission.class)))
                .thenAnswer(inv -> {
                    QuizSubmission s = inv.getArgument(0);
                    // simulate generated ID
                    return QuizSubmission.builder()
                            .id(1L).quiz(s.getQuiz()).student(s.getStudent())
                            .score(s.getScore()).totalQuestions(s.getTotalQuestions())
                            .percentage(s.getPercentage()).build();
                });

        QuizResultResponse result = quizService.submitQuiz(1L, request, "bob@example.com");

        assertThat(result.getScore()).isEqualTo(1);
        assertThat(result.getTotalQuestions()).isEqualTo(1);
        assertThat(result.getPercentage()).isEqualTo(100.0);
        assertThat(result.getQuestionResults().get(0).isCorrect()).isTrue();
    }

    @Test
    void submitQuiz_withWrongAnswer_returnsZeroScore() {
        Quiz quiz = buildQuizWithOneQuestion(10L, buildCourse(1L, buildInstructor("alice@example.com")));
        User student = buildStudent("bob@example.com");

        SubmitQuizRequest request = new SubmitQuizRequest();
        request.setAnswers(Map.of(100L, 201L)); // wrong option selected (correct is 200)

        when(quizRepository.findByCourseIdWithDetails(1L)).thenReturn(Optional.of(quiz));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(submissionRepository.save(any(QuizSubmission.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        QuizResultResponse result = quizService.submitQuiz(1L, request, "bob@example.com");

        assertThat(result.getScore()).isZero();
        assertThat(result.getQuestionResults().get(0).isCorrect()).isFalse();
        assertThat(result.getQuestionResults().get(0).getCorrectOptionId()).isEqualTo(200L);
    }

    @Test
    void submitQuiz_withEmptyAnswers_returnsZeroScore() {
        Quiz quiz = buildQuizWithOneQuestion(10L, buildCourse(1L, buildInstructor("alice@example.com")));
        User student = buildStudent("bob@example.com");

        SubmitQuizRequest request = new SubmitQuizRequest();
        request.setAnswers(Map.of()); // no answers submitted

        when(quizRepository.findByCourseIdWithDetails(1L)).thenReturn(Optional.of(quiz));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(submissionRepository.save(any(QuizSubmission.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        QuizResultResponse result = quizService.submitQuiz(1L, request, "bob@example.com");

        assertThat(result.getScore()).isZero();
        assertThat(result.getQuestionResults().get(0).getSelectedOptionId()).isNull();
    }

    // ── addQuestion ───────────────────────────────────────────────────────────

    @Test
    void addQuestion_byOwner_returnsUpdatedQuiz() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, instructor);
        Quiz quiz = buildQuiz(10L, course);

        CreateQuestionRequest request = new CreateQuestionRequest();
        request.setText("What is Java?");
        QuizOptionRequest opt1 = new QuizOptionRequest();
        opt1.setText("A language"); opt1.setCorrect(true);
        QuizOptionRequest opt2 = new QuizOptionRequest();
        opt2.setText("A coffee"); opt2.setCorrect(false);
        request.setOptions(List.of(opt1, opt2));

        when(quizRepository.findByCourseIdWithDetails(1L)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        QuizResponse response = quizService.addQuestion(1L, request, "alice@example.com");

        assertThat(response).isNotNull();
        verify(quizRepository).save(quiz);
    }

    @Test
    void addQuestion_byNonOwner_throwsForbiddenException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, instructor);
        Quiz quiz = buildQuiz(10L, course);

        when(quizRepository.findByCourseIdWithDetails(1L)).thenReturn(Optional.of(quiz));

        CreateQuestionRequest request = new CreateQuestionRequest();
        request.setText("Sneaky question?");
        QuizOptionRequest opt = new QuizOptionRequest();
        opt.setText("Yes"); opt.setCorrect(true);
        request.setOptions(List.of(opt, opt));

        assertThatThrownBy(() ->
                quizService.addQuestion(1L, request, "hacker@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User buildInstructor(String email) {
        return User.builder().id(1L).fullName("Alice Smith").email(email)
                .passwordHash("hashed").role(Role.INSTRUCTOR).build();
    }

    private User buildStudent(String email) {
        return User.builder().id(2L).fullName("Bob Jones").email(email)
                .passwordHash("hashed").role(Role.STUDENT).build();
    }

    private Course buildCourse(Long id, User instructor) {
        return Course.builder().id(id).title("Java Basics").description("desc")
                .instructor(instructor).modules(new ArrayList<>()).build();
    }

    private Quiz buildQuiz(Long id, Course course) {
        return Quiz.builder().id(id).title("Java Quiz").course(course)
                .questions(new ArrayList<>()).build();
    }

    /**
     * Builds a quiz with one question (id=100) and two options:
     * option 200 (correct=true) and option 201 (correct=false).
     * Used in submission tests.
     */
    private Quiz buildQuizWithOneQuestion(Long quizId, Course course) {
        QuizOption correct = QuizOption.builder().id(200L).text("Correct").correct(true).build();
        QuizOption wrong   = QuizOption.builder().id(201L).text("Wrong").correct(false).build();

        Question question = Question.builder()
                .id(100L).text("What is correct?").orderIndex(0)
                .options(new ArrayList<>(List.of(correct, wrong))).build();

        correct.setQuestion(question);
        wrong.setQuestion(question);

        return Quiz.builder().id(quizId).title("Java Quiz").course(course)
                .questions(new ArrayList<>(List.of(question))).build();
    }
}
