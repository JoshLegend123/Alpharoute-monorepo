// apps/frontend/src/pages/_error.tsx
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: '2rem' }}>
      <h2 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>
        // ERROR_{statusCode || 'UNKNOWN'}: SYSTEM_EXCEPTION
      </h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
        An unexpected execution anomaly occurred inside the AlphaRoute core matrix.
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;