'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '../components/Input';
import { Button } from '../components/Button';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Redirect and reload routing state to pass the middleware barrier
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Authentication failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Authentication request failed:', err);
      setError('Connection failure.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm border border-neutral-900 bg-black p-6 md:p-8 rounded space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <img src="/favicon.png" alt="Logo" className="w-8 h-8 invert mb-1" />
          <h2 className="text-xs font-semibold tracking-widest uppercase text-white font-mono">
            SYS_LOCK_ACTIVE
          </h2>
          <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
            Enter Administrator Key
          </p>
        </div>

        {/* Input & Form Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Access Token / Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={error}
            autoFocus
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Unlock Dashboard'}
          </Button>
        </form>
        
      </div>
    </div>
  );
}
