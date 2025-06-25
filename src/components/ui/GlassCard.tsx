'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'sm' | 'lg' | 'xl';
  hoverable?: boolean;
  lens?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = false,
  lens = false,
}) => {
  const variantClasses = {
    default: 'glass-card',
    sm: 'glass-card glass-sm',
    lg: 'glass-card glass-lg',
    xl: 'glass-card glass-xl',
  };

  const classes = [
    variantClasses[variant],
    hoverable && 'glass-hover',
    lens && 'glass-lens',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};