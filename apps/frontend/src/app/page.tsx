// apps/frontend/src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import DashboardContainer from '../components/DashboardContainer';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // Force the application to mount strictly on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div>Initializing AlphaRoute Terminal Engine...</div>
      </main>
    );
  }

  return <DashboardContainer />;
}