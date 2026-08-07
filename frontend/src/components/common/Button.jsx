import React from 'react';

/**
 * Reusable Button component for CTAs and actions.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'danger'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} props.children
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  style = {},
  type = 'button',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger)',
          color: '#ffffff',
          border: 'none',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--accent-primary)',
          color: '#ffffff',
          border: 'none',
          boxShadow: 'var(--shadow-glow)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.85rem' };
      case 'lg':
        return { padding: '14px 24px', fontSize: '1.05rem' };
      case 'md':
      default:
        return { padding: '10px 18px', fontSize: '0.95rem' };
    }
  };

  const baseStyles = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all var(--transition-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
    boxSizing: 'border-box',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      style={baseStyles}
      className={`custom-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTopColor: '#ffffff',
            animation: 'spin 0.8s linear infinite',
            marginRight: children ? '8px' : '0',
          }}
        />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
