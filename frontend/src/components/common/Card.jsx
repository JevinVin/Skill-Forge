import React from 'react';

/**
 * Reusable Card container component.
 *
 * @param {Object} props
 * @param {boolean} [props.hoverable=false]
 * @param {React.ReactNode} props.children
 */
export const Card = ({
  children,
  hoverable = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-md)',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
        cursor: onClick || hoverable ? 'pointer' : 'default',
        boxSizing: 'border-box',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
