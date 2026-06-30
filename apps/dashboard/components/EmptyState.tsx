import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded p-10 text-center max-w-md mx-auto my-8">
      <div className="w-6 h-6 rounded-full border border-neutral-700 flex items-center justify-center mb-4 text-neutral-400 font-mono text-xs select-none">
        !
      </div>
      <h3 className="text-xs font-semibold text-white mb-2 uppercase tracking-widest font-mono">{title}</h3>
      <p className="text-xs text-neutral-400 font-mono leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}

export default EmptyState;
