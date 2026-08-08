import React, { useState, useRef, useEffect } from 'react';
import { askAiTutor } from '../../api/aiApi';

/**
 * AiTutorWidget component — floating context-aware AI Assistant widget.
 * Positioned in the bottom-right corner of the screen, answering student queries
 * about current course lessons and Skillforge platform features.
 */
const AiTutorWidget = ({ courseTitle, activeLesson }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your Skillforge AI Assistant. Ask me anything about your current lesson or how the platform works!`,
      contextUsed: 'Platform Assistant',
      suggestedFollowUps: [
        'Explain this lesson simply',
        'How do 100% module quizzes work?',
        'How do I import quizzes from CSV/JSON?',
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const userMsg = { sender: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    try {
      const response = await askAiTutor({
        question: textToSend.trim(),
        courseTitle: courseTitle || 'Skillforge Course',
        lessonTitle: activeLesson?.title || 'Current Lesson',
        lessonContent: activeLesson?.content || '',
      });

      const aiMsg = {
        sender: 'ai',
        text: response.answer,
        contextUsed: response.contextUsed,
        suggestedFollowUps: response.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'ai',
        text: 'Sorry, I had trouble processing your question. Please try again.',
        contextUsed: 'Error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 900 }}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '30px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-fast)',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <span>AI Assistant</span>
        </button>
      )}

      {/* Expanded Chat Drawer Container */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            maxHeight: '560px',
            height: '80vh',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat Drawer Header */}
          <div style={{
            padding: '14px 18px',
            backgroundColor: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🤖</span> Skillforge AI Tutor
              </h3>
              {activeLesson?.title && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', display: 'block' }}>
                  Studying: {activeLesson.title}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-primary)',
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {msg.contextUsed && (
                  <span style={{ display: 'block', fontSize: '0.7rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '4px' }}>
                    Source: {msg.contextUsed}
                  </span>
                )}

                {/* Suggested Follow-up Prompts */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    {msg.suggestedFollowUps.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        style={{
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid var(--accent-primary)',
                          borderRadius: '12px',
                          color: 'var(--accent-light)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-tertiary)', padding: '8px 14px', borderRadius: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                🤖 AI Assistant is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Ask a question about lesson or platform..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isTyping || !inputQuery.trim()}
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: !inputQuery.trim() ? 'not-allowed' : 'pointer',
                opacity: !inputQuery.trim() ? 0.6 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiTutorWidget;
