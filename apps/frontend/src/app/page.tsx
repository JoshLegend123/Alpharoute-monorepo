// apps/frontend/src/app/page.tsx
"use client";

import dynamic from 'next/dynamic';

// Force Next.js to completely skip pre-rendering this component at build time
const DynamicDashboard = dynamic(
  () => import('../components/DashboardContainer'),
  { 
    ssr: false,
    loading: () => (
      <main style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div>Initializing AlphaRoute Terminal Engine...</div>
      </main>
    )
  }
);

export default function Home() {
  return <DynamicDashboard />;
}