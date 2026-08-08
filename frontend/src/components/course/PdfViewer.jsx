import React, { useState } from 'react';

/**
 * PdfViewer component — renders PDF documents directly on the lesson webpage
 * with dark mode theme consistency, Fullscreen toggle mode, inline viewer,
 * and direct PDF view/download options.
 */
const PdfViewer = ({ pdfUrl, title }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!pdfUrl) return null;

  // Resolve absolute backend URL if relative path provided
  const targetUrl = pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8080${pdfUrl}`;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      style={
        isFullscreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '16px',
              marginBottom: '24px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }
      }
    >
      {/* Control Bar: Title, Fullscreen Toggle & Download */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: isFullscreen ? 'var(--radius-md)' : '0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📄</span>
          <span>{title || 'PDF Document Content'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-light)',
              border: '1px solid var(--accent-primary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isFullscreen ? '↙ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ⬇ Open PDF
          </a>
        </div>
      </div>

      {/* Embedded Document Viewport with same-origin frame options enabled */}
      <div style={{
        width: '100%',
        height: isFullscreen ? 'calc(100vh - 80px)' : '650px',
        backgroundColor: '#ffffff',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <iframe
          src={targetUrl}
          title={title || 'PDF Document Viewer'}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
