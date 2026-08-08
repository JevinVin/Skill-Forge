import React, { useState } from 'react';

/**
 * PdfViewer component — renders PDF documents directly on the lesson webpage
 * with consistent website styling, dark theme fonts, scrollable viewport,
 * and direct PDF view/download options.
 */
const PdfViewer = ({ pdfUrl, title }) => {
  if (!pdfUrl) return null;

  // Resolve absolute backend URL if relative path provided
  const targetUrl = pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8080${pdfUrl}`;
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginTop: '16px',
      marginBottom: '24px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header bar matching website theme */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📄</span>
          <span>{title || 'PDF Document Content'}</span>
        </div>

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
            transition: 'all var(--transition-fast)',
          }}
        >
          ⬇ Open PDF in New Tab
        </a>
      </div>

      {/* Embedded Document Viewport */}
      <div style={{
        width: '100%',
        height: '600px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        position: 'relative',
      }}>
        <object
          data={targetUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          onError={() => setHasError(true)}
          style={{ border: 'none', width: '100%', height: '100%' }}
        >
          <iframe
            src={targetUrl}
            title={title || 'Document'}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </object>
      </div>
    </div>
  );
};

export default PdfViewer;
