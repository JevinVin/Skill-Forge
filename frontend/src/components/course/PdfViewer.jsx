import React, { useState } from 'react';

/**
 * PdfViewer component — renders document content natively on the webpage
 * using Skillforge's modern dark theme typography, scrollable viewport,
 * Fullscreen toggle mode, and direct PDF view/download options.
 */
const PdfViewer = ({ pdfUrl, title, textContent }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!pdfUrl && !textContent) return null;

  // Resolve absolute backend URL if relative path provided
  const targetUrl = pdfUrl ? (pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8080${pdfUrl}`) : null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
              padding: '20px',
              overflowY: 'auto',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '16px',
              marginBottom: '24px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }
      }
    >
      {/* Document Toolbar */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: isFullscreen ? 'var(--radius-md)' : '0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <span>{title || 'Document Viewer'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {textContent && (
            <button
              type="button"
              onClick={handleCopyText}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy Text'}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-light)',
              border: '1px solid var(--accent-primary)',
              padding: '6px 14px',
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

          {targetUrl && (
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
              ⬇ Download / View PDF
            </a>
          )}
        </div>
      </div>

      {/* Native Webpage Document Viewport */}
      <div style={{
        padding: '28px',
        backgroundColor: 'var(--bg-secondary)',
        minHeight: isFullscreen ? 'calc(100vh - 100px)' : '450px',
        maxHeight: isFullscreen ? 'none' : '650px',
        overflowY: 'auto',
      }}>
        {textContent ? (
          <div style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'pre-wrap',
            letterSpacing: '0.2px',
          }}>
            {textContent}
          </div>
        ) : (
          <div style={{ width: '100%', height: '550px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <iframe
              src={targetUrl}
              title={title || 'Document Content'}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
