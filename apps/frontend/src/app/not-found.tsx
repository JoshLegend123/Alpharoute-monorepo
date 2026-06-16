// apps/frontend/src/app/not-found.tsx
"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: '2rem' }}>
      <h2 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>// ERROR_404: ROUTE_NOT_FOUND</h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '2rem' }}>The requested matrix coordinates do not exist inside the AlphaRoute core.</p>
      <Link 
        href="/" 
        style={{ backgroundColor: '#f4f4f5', color: '#09090b', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', textDecoration: 'none' }}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}