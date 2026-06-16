// apps/frontend/src/app/error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error matrix tracking context safely to your console
    console.error('System Exception Encountered:', error);
  }, [error]);

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: '2rem' }}>
      <h2 style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
        // SYSTEM_EXCEPTION: ALPHA_ROUTE_CORE_MATRIX_ANOMALY
      </h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '2rem' }}>
        An unexpected runtime initialization error interrupted the terminal engine.
      </p>
      <button
        onClick={() => reset()}
        style={{ backgroundColor: '#18181b', color: '#f4f4f5', border: '1px solid #27272a', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8125rem' }}
      >
        Re-initialize Matrix Engine
      </button>
    </div>
  );
}