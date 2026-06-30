import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "py-2 px-4 rounded text-xs font-mono uppercase tracking-wider transition-all focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed text-center";
  
  const variants = {
    primary: "bg-white text-black border border-white hover:bg-neutral-200 active:bg-neutral-300",
    secondary: "bg-black text-neutral-300 border border-neutral-800 hover:text-white hover:bg-neutral-900 active:bg-neutral-950",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export default Button;
