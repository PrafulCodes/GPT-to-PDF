import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-800/80 bg-neutral-950/30 rounded-xl p-10 text-center mx-auto my-8 w-full">
      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center mb-4 text-neutral-500">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm">{description}</p>
    </div>
  );
}

export default EmptyState;
