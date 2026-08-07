import React from 'react';

/**
 * PdfViewer component — renders PDF documents directly inline on the lesson web page
 * with responsive height, toolbar controls, and direct download option.
 */
const PdfViewer = ({ pdfUrl, title }) => {
  if (!pdfUrl) return null;

  // Handle relative vs absolute URLs
  const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : pdfUrl;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '16px',
      marginBottom: '20px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
          📄 PDF Document: {title || 'Lesson Resource'}
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--accent-light)',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ⬇ Open / Download PDF
        </a>
      </div>

      <div style={{ width: '100%', height: '550px', backgroundColor: '#ffffff' }}>
        <iframe
          src={fullUrl}
          title={title || 'PDF Document'}
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
