'use client';

import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors ${
            error ? 'border-neutral-500' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="block text-[10px] font-mono text-neutral-400">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export function PasswordInput(props: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        type={show ? 'text' : 'password'}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(!show)}
        className="absolute right-3 bottom-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-300 focus:outline-none"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export default Input;
