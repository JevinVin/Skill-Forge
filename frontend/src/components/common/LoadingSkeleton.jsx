import React from 'react';

/**
 * Reusable LoadingSkeleton placeholder for sleek dark loading states.
 *
 * @param {Object} props
 * @param {string|number} [props.width='100%']
 * @param {string|number} [props.height='20px']
 * @param {string|number} [props.borderRadius='var(--radius-sm)']
 */
export const LoadingSkeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`animate-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        boxSizing: 'border-box',
        ...style,
      }}
    />
  );
};

export default LoadingSkeleton;
