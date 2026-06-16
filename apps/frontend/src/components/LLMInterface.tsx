// apps/frontend/src/components/LLMInterface.tsx
"use client";

import { useState } from 'react';

// 1. DEFINE PROPS INTERFACE TO ACCEPT DYNAMIC WALLET ROUTING FROM THE DASHBOARD
interface LLMInterfaceProps {
  onExecuteTransaction?: (txBase64Data: string) => Promise<string>;
  isWalletConnected?: boolean;
}

export default function LLMInterface({ onExecuteTransaction, isWalletConnected = false }: LLMInterfaceProps) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [compiledTx, setCompiledTx] = useState<string | null>(null);
  
  // Secondary runtime status tracking loop inside the client terminal card panel
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'success' | 'failed'>('idle');
  const [txDigest, setTxDigest] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const controller = new AbortController();
    setLoading(true);
    setResponse('Routing prompt matrix to AlphaRoute Intent Kernel...');
    setCompiledTx(null);
    setTxStatus('idle');
    setTxDigest(null);

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

  // 2. TRIGGER ON-CHAIN WALLET POPUP ROUTINE INTERFACES NATIVELY
  const handleAuthorizeWalletTx = async () => {
    if (!compiledTx || !onExecuteTransaction) return;
    
    setTxStatus('signing');
    try {
      const digest = await onExecuteTransaction(compiledTx);
      setTxDigest(digest);
      setTxStatus('success');
      setResponse(prev => `${prev}\n\n📦 [CHAIN VERIFIED SUCCESS]\nTransaction Digest: ${digest}\nYour funds have been successfully routed into the optimal liquidity vault layer.`);
    } catch (error: any) {
      console.error("[Wallet Interface Crash]", error);
      setTxStatus('failed');
      setResponse(prev => `${prev}\n\n⚠️ [USER EXPORT CANCELLED]\nWallet signature authorization failed: ${error.message || 'Signature rejected by user'}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#18181b40', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.5rem', fontFamily: 'monospace' }}>
      {/* Console Display Screen */}
      <div style={{ backgroundColor: '#09090b', borderRadius: '0.5rem', padding: '1rem', minHeight: '12rem', marginBottom: '1rem', border: '1px solid #18181b', whiteSpace: 'pre-wrap', color: '#34d399', fontSize: '0.875rem', overflowY: 'auto' }}>
        {response || '> System idle. Awaiting yield optimization execution strings...'}
      </div>

      {/* 3. DYNAMIC WALLET POPUP CONTROLLER ACTION FRAME */}
      {compiledTx && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: txStatus === 'success' ? 'rgba(16, 185, 129, 0.08)' : txStatus === 'failed' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(52, 211, 153, 0.05)', border: `1px solid ${txStatus === 'success' ? '#10b98140' : txStatus === 'failed' ? '#ef444440' : '#34d39925'}`, borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: txStatus === 'success' ? '#10b981' : txStatus === 'failed' ? '#ef4444' : '#34d399' }}>
            {txStatus === 'idle' && "✨ Executable Sui PTB payload compiled and signed to client memory matrix. Ready for on-chain execution."}
            {txStatus === 'signing' && "🔗 Initializing Wallet Signatures... Please check your wallet extension workspace popup."}
            {txStatus === 'success' && `🚀 Transaction executed successfully on-chain! Block Digest: ${txDigest}`}
            {txStatus === 'failed' && "⚠️ Transaction compilation cancelled or dropped due to client context signature failure."}
          </div>
          
          {txStatus !== 'success' && txStatus !== 'signing' && (
            <div>
              {isWalletConnected ? (
                <button
                  onClick={handleAuthorizeWalletTx}
                  style={{ backgroundColor: '#34d399', color: '#09090b', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.1s' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  APPROVE TRANSACTION ON-CHAIN →
                </button>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontStyle: 'italic' }}>
  [Wallet connection required above to authorize on-chain deployment of this strategy package]
</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input Form Action Row */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Take 100 vSUI and optimize my yields right now."
          disabled={loading || txStatus === 'signing'}
          style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#ffffff', outline: 'none', fontSize: '0.875rem' }}
        />
        <button
          type="submit"
          disabled={loading || txStatus === 'signing'}
          style={{ backgroundColor: loading || txStatus === 'signing' ? '#27272a' : '#f4f4f5', color: loading || txStatus === 'signing' ? '#71717a' : '#09090b', border: 'none', padding: '0 1.5rem', width: '8rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: loading || txStatus === 'signing' ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
        >
          {loading ? 'Routing...' : 'EXECUTE'}
        </button>
      </form>
    </div>
  );
}