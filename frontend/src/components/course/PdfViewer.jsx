import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure Mozilla PDF.js worker via CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;



/**
 * PdfViewer component — renders PDF documents 100% natively on HTML5 canvas elements
 * directly on the webpage using Mozilla PDF.js.
 * Zero iframe dependence, 0% browser connection errors, full dark theme styling, page controls,
 * and Fullscreen reading mode!
 */
const PdfViewer = ({ pdfUrl, title, textContent }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const targetUrl = pdfUrl ? (pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8080${pdfUrl}`) : null;

  // Load PDF Document
  useEffect(() => {
    if (!targetUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setError('');

    const loadingTask = pdfjsLib.getDocument(targetUrl);
    loadingTask.promise
      .then((doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('PDF loading error:', err);
        setError('Failed to load PDF preview. You can read the text content below or download the file.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  // Render Page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    pdfDoc.getPage(pageNum).then((page) => {
      if (isCancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise.catch((err) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
      });
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

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
      {/* Control Toolbar */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: isFullscreen ? 'var(--radius-md)' : '0',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <span>{title || 'Document Viewer'}</span>
        </div>

        {/* Page Navigation Controls */}
        {numPages > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              disabled={pageNum <= 1}
              onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
                opacity: pageNum <= 1 ? 0.5 : 1,
              }}
            >
              ‹ Prev
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Page {pageNum} of {numPages}
            </span>

            <button
              type="button"
              disabled={pageNum >= numPages}
              onClick={() => setPageNum((prev) => Math.min(prev + 1, numPages))}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                cursor: pageNum >= numPages ? 'not-allowed' : 'pointer',
                opacity: pageNum >= numPages ? 0.5 : 1,
              }}
            >
              Next ›
            </button>

            <span style={{ borderLeft: '1px solid var(--border-color)', height: '16px', margin: '0 4px' }} />

            <button
              type="button"
              onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.6))}
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              🔍 -
            </button>
            <button
              type="button"
              onClick={() => setScale((prev) => Math.min(prev + 0.2, 2.5))}
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              🔍 +
            </button>
          </div>
        )}

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
              ⬇ Download PDF
            </a>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: '#1e293b',
        maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '650px',
        overflow: 'auto',
      }}>
        {isLoading && (
          <div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            ⏳ Loading PDF pages on webpage...
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', padding: '20px' }}>
            {error}
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-sm)',
            maxWidth: '100%',
            display: isLoading || error ? 'none' : 'block',
          }}
        />
      </div>

      {/* Text Content Notes Below */}
      {textContent && (
        <div style={{ padding: '24px 28px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Written Lesson Content & Notes:
          </h4>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {textContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
