import React from 'react';

/**
 * CertificateModal component — renders a gold-badged Certificate of Completion
 * for students who complete 100% of a course and pass quizzes with 100% accuracy.
 * Includes native print/PDF export styling.
 */
const CertificateModal = ({ certificateData, onClose }) => {
  if (!certificateData) return null;

  const handlePrint = () => {
    window.print();
  };

  const { studentName, courseTitle, instructorName, certificateId, issueDate } = certificateData;

  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: '20px',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Printable Certificate Frame */}
        <div
          className="printable-certificate"
          style={{
            padding: '40px',
            border: '8px double #eab308',
            margin: '16px',
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            textAlign: 'center',
            position: 'relative',
            background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
          }}
        >
          {/* Gold Crest */}
          <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🎓</div>

          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#eab308', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Skillforge Official Certificate of Completion
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#94a3b8', marginBottom: '16px', fontFamily: 'serif' }}>
            This certifies that
          </h2>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#6366f1', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            {studentName}
          </h1>

          <p style={{ fontSize: '1rem', color: '#cbd5e1', maxWidth: '550px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            has successfully completed 100% of the course modules and achieved 100% quiz accuracy for:
          </p>

          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginBottom: '28px' }}>
            "{courseTitle}"
          </h3>

          {/* Footer Metadata & Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Verified Certificate ID</span>
              <strong style={{ fontSize: '0.9rem', color: '#eab308', fontFamily: 'monospace' }}>{certificateId || 'SF-CERT-8F3A29'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Issued: {formattedDate}</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Instructor / Authority</span>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{instructorName}</strong>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>✓ Verified by Skillforge</div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div style={{ padding: '16px 24px', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <span>🖨️</span> Print / Save as PDF Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
