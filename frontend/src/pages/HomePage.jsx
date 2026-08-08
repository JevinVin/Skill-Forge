import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Card, Button } from '../components/common';

import AiTutorWidget from '../components/ai/AiTutorWidget';

/**
 * HomePage / About Landing Page — featuring Hero Banner with gradient headings,
 * Platform Highlights & Stats, Featured Courses Grid, Student Reviews & Teacher Remarks,
 * and Interactive FAQs.
 */
const FEATURED_COURSES = [
  {
    id: 1,
    title: 'Full Stack Java & React Mastery',
    category: 'Java & Backend',
    instructor: 'Alex Rivera',
    rating: '4.9',
    students: '2,420',
    image: '☕',
    description: 'Master modern Spring Boot 3 microservices and React 18 frontend architecture step-by-step.',
  },
  {
    id: 2,
    title: 'Python for AI & Data Science',
    category: 'AI & Machine Learning',
    instructor: 'Dr. Sophia Zhang',
    rating: '4.95',
    students: '1,890',
    image: '🐍',
    description: 'Build predictive AI models, pandas pipelines, and machine learning algorithms from scratch.',
  },
  {
    id: 3,
    title: 'Modern Web Development Bootcamp',
    category: 'Web Development',
    instructor: 'Marcus Chen',
    rating: '4.88',
    students: '3,100',
    image: '⚡',
    description: 'Comprehensive HTML5, CSS3, JavaScript ES6+, and responsive UI design masterclass.',
  },
];

const STUDENT_REVIEWS = [
  {
    id: 1,
    name: 'Emily Watson',
    role: 'Full Stack Developer at TechCorp',
    avatar: '👩‍💻',
    rating: 5,
    review: 'Skillforge transformed my career! The VSCode Code Studio inside lessons allowed me to practice without setting up complex environments.',
    teacherRemark: '“Emily demonstrated exceptional algorithmic problem-solving and completed 100% of quizzes on her first attempt.” — Prof. Alex Rivera',
  },
  {
    id: 2,
    name: 'David Kim',
    role: 'Software Engineer',
    avatar: '👨‍💻',
    rating: 5,
    review: 'The 100% quiz accuracy rule and official Gold Certificates really made me master the material rather than just skimming videos.',
    teacherRemark: '“David’s dedication to perfect quiz scores showed true mastery of Spring Boot architecture.” — Dr. Sophia Zhang',
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    role: 'Data Analyst',
    avatar: '👩‍🔬',
    rating: 5,
    review: 'The AI Tutor chatbot answered all my Python syntax questions instantly while studying. It felt like having a personal mentor 24/7!',
    teacherRemark: '“Sarah asked high-level analytical questions and completed the Data Science track with distinction.” — Marcus Chen',
  },
];

const FAQS = [
  {
    q: 'How does Skillforge guarantee true skill mastery?',
    a: 'Skillforge enforces strict progress tracking: lessons auto-complete as you study, and module certificates/badges require 100% accuracy on module quizzes to ensure complete concept mastery.',
  },
  {
    q: 'What is the AI Tutor Assistant?',
    a: 'Our built-in AI Tutor is available 24/7 inside lessons to answer your coding questions, explain difficult concepts, and guide you through coursework.',
  },
  {
    q: 'Can I write and run real code on Skillforge?',
    a: 'Yes! Skillforge features an integrated full-screen VSCode Code Studio with draggable terminal, line numbers, and live code execution for Java, Python, JavaScript, and HTML/CSS.',
  },
  {
    q: 'How do I receive my official Certificate of Completion?',
    a: 'Once you reach 100% overall course progress (all lessons completed + 100% score on all quizzes), your official printable certificate with verification hash unlocks automatically.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-light)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            <span>✨</span> Next-Generation Interactive Learning Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 70%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Master Modern Software Skills with AI & Live Coding Studio
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 36px',
          }}>
            Skillforge combines interactive multi-media lessons, 24/7 AI tutoring, a full-screen VSCode Code Studio, and verified 100% mastery certificates.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/courses')}
              style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 800 }}
            >
              📚 Explore All Courses
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/playground')}
              style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700, borderColor: 'var(--accent-primary)', color: 'var(--accent-light)' }}
            >
              💻 Try Code Studio
            </Button>
          </div>
        </div>
      </section>

      {/* STATS COUNTER BAR */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-light)', marginBottom: '4px' }}>10,000+</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Learners</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)', marginBottom: '4px' }}>99.4%</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quiz Completion Rate</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#eab308', marginBottom: '4px' }}>5,200+</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Certificates Issued</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-light)', marginBottom: '4px' }}>24 / 7</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Study Assistant Support</span>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES HIGHLIGHTS */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Built for High-Impact Technical Mastery
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to go from beginner to industry-ready engineer.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <Card style={{ padding: '28px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🤖</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>AI Study Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Get instant, context-aware answers for your lesson questions and debugging assistance 24/7.
            </p>
          </Card>

          <Card style={{ padding: '28px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💻</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>VSCode Code Studio</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Practice Java, Python, JavaScript, and HTML directly inside lessons with a resizable terminal.
            </p>
          </Card>

          <Card style={{ padding: '28px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎓</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Verified Certificates</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Earn official printable Gold Certificates of Completion with unique verification hashes.
            </p>
          </Card>

          <Card style={{ padding: '28px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>100% Mastery Quizzes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Validate your knowledge with module quizzes requiring 100% accuracy for true concept retention.
            </p>
          </Card>
        </div>
      </section>

      {/* FEATURED COURSES PREVIEW GRID */}
      <section style={{ padding: '60px 24px 80px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Featured Featured Courses
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Explore top-rated learning paths designed by industry experts.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/courses')}>
              View All Courses →
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {FEATURED_COURSES.map((course) => (
              <Card key={course.id} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '2.2rem' }}>{course.image}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-light)', backgroundColor: 'rgba(99, 102, 241, 0.12)', padding: '4px 10px', borderRadius: '12px' }}>
                      {course.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {course.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <span>👤 {course.instructor}</span>
                    <span>⭐ {course.rating} ({course.students})</span>
                  </div>

                  <Button variant="primary" fullWidth onClick={() => navigate('/courses')}>
                    Start Course Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT REVIEWS & INSTRUCTOR REMARKS SECTION */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Student Reviews & Teacher Remarks
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Hear from our successful graduates and what instructors say about their journey.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {STUDENT_REVIEWS.map((rev) => (
            <Card key={rev.id} style={{ padding: '28px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '2rem', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rev.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rev.role}</span>
                  </div>
                </div>

                <div style={{ color: '#eab308', marginBottom: '14px', fontSize: '1rem' }}>
                  {'★'.repeat(rev.rating)}
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                  "{rev.review}"
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Instructor Remark
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                  {rev.teacherRemark}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* INTERACTIVE FAQS SECTION */}
      <section style={{ padding: '60px 24px 80px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Everything you need to know about Skillforge platform features.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FAQS.map((faq, index) => (
              <Card
                key={index}
                onClick={() => toggleFaq(index)}
                style={{ padding: '20px 24px', cursor: 'pointer', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.02rem' }}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--accent-light)' }}>{openFaq === index ? '−' : '+'}</span>
                </div>
                {openFaq === index && (
                  <p style={{ marginTop: '14px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    {faq.a}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#090d16', borderTop: '1px solid var(--border-color)', padding: '48px 24px 32px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '36px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SF</div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Skillforge</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The interactive e-learning platform with AI study assistance, VSCode Code Studio, and verified certificates.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Courses Catalog</Link>
              <Link to="/playground" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Code Studio</Link>
              <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Student Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Official Support</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              📧 Gmail: <a href="mailto:support.skillforge@gmail.com" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>support.skillforge@gmail.com</a>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Available 24/7 for student & instructor inquiries.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          © {new Date().getFullYear()} Skillforge Learning Platform. All rights reserved.
        </div>
      </footer>

      {/* Floating AI Tutor Widget */}
      <AiTutorWidget />
    </div>
  );
};

export default HomePage;
