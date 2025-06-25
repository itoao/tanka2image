'use client';

import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'glass-button',
    secondary: 'glass-button opacity-80',
    ghost: 'glass glass-hover glass-active',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = [
    variantClasses[variant],
    sizeClasses[size],
    'font-medium rounded-full inline-flex items-center gap-2 cursor-pointer',
    className,
  ].join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </button>
  );
};