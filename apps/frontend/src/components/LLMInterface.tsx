// apps/frontend/src/components/LLMInterface.tsx
"use client";

import { useState } from 'react';

export default function LLMInterface() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [compiledTx, setCompiledTx] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const controller = new AbortController();
    setLoading(true);
    setResponse('Routing prompt matrix to AlphaRoute Intent Kernel...');
    setCompiledTx(null);

    try {
      const res = await fetch("https://alpharoutebackend-production-40c9.up.railway.app/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        throw new Error(`Server network mismatch returned status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.reply);
      
      if (data.txData) {
        setCompiledTx(data.txData);
        console.log('🔗 Executable Sui PTB Data Vector Cached:', data.txData);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream request aborted.');
      } else {
        console.error('Terminal Submission Exception:', err);
        setResponse("Error capturing stream execution: Network response handshake failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#18181b40', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.5rem', fontFamily: 'monospace' }}>
      {/* Console Display Screen */}
      <div style={{ backgroundColor: '#09090b', borderRadius: '0.5rem', padding: '1rem', minHeight: '12rem', marginBottom: '1rem', border: '1px solid #18181b', whiteSpace: 'pre-wrap', color: '#34d399', fontSize: '0.875rem', overflowY: 'auto' }}>
        {response || '> System idle. Awaiting yield optimization execution strings...'}
      </div>

      {/* Transaction Status Tag */}
      {compiledTx && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d39930', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#34d399' }}>
          ✨ Executable Sui PTB payload compiled and signed to client memory matrix. Ready for on-chain execution.
        </div>
      )}

      {/* Input Form Action Row */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Take 100 vSUI and optimize my yields right now."
          disabled={loading}
          style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#ffffff', outline: 'none', fontSize: '0.875rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: loading ? '#27272a' : '#f4f4f5', color: loading ? '#71717a' : '#09090b', border: 'none', padding: '0 1.5rem', width: '8rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
        >
          {loading ? 'Routing...' : 'EXECUTE'}
        </button>
      </form>
    </div>
  );
}