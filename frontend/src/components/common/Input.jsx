import React, { useState } from 'react';

/**
 * Reusable Form Input component.
 *
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.type='text'] - When 'password', renders a show/hide toggle.
 */
export const Input = ({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  style = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={inputId}
          type={resolvedType}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            padding: isPassword ? '10px 42px 10px 14px' : '10px 14px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--color-danger)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            width: '100%',
            boxSizing: 'border-box',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--border-focus)';
              e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPassword ? (
              // Eye-off icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              // Eye icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '2px' }}>
          {error}
        </span>
      )}

      {!error && helperText && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
