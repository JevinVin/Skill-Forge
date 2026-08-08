import React, { useState } from 'react';

/**
 * PdfViewer component — renders document content 100% natively on the webpage.
 * Completely eliminates <iframe> reliance to prevent any browser 'refused to connect' errors,
 * providing Fullscreen reading mode, styled typography, and direct PDF download options.
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
              padding: '24px',
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
      {/* Control Bar */}
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
            {isFullscreen ? '↙ Exit Fullscreen' : '⛶ Fullscreen Reading Mode'}
          </button>

          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
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
              ⬇ Download File
            </a>
          )}
        </div>
      </div>

      {/* Native Webpage Document Viewport */}
      <div style={{
        padding: '32px',
        backgroundColor: 'var(--bg-secondary)',
        minHeight: isFullscreen ? 'calc(100vh - 120px)' : '350px',
        overflowY: 'auto',
      }}>
        {textContent ? (
          <div style={{
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'pre-wrap',
            letterSpacing: '0.2px',
          }}>
            {textContent}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {title || 'Document File Attached'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', marginBottom: '20px' }}>
              This lesson includes an attached document. You can read written study notes on the webpage or download the full document file below.
            </p>
            {targetUrl && (
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                ⬇ Download / Open PDF File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
