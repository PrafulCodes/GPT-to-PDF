import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Card({ children, title, subtitle, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-black border border-neutral-900 rounded p-6 hover:border-neutral-800 transition-colors ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-neutral-400 font-mono">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
