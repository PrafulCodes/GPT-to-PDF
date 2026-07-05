import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Card({ children, title, subtitle, className = '', ...props }: CardProps) {
  // Combine custom classes with the base classes
  const baseClasses = "bg-[#0a0a0a] border border-neutral-900/80 rounded-xl shadow-sm hover:border-neutral-800 transition-colors";
  const finalClassName = className.includes('bg-') ? className : `${baseClasses} p-6 ${className}`;

  return (
    <div
      className={finalClassName}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && <h3 className="text-sm font-medium tracking-tight text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
