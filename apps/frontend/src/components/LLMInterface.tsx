// apps/frontend/src/components/LLMInterface.tsx
"use client";

import { useState } from 'react';

interface LLMInterfaceProps {
  onExecuteTransaction?: (txBase64Data: string) => Promise<string>;
  isWalletConnected?: boolean;
  walletAddress?: string;
}

export default function LLMInterface({ 
  onExecuteTransaction, 
  isWalletConnected = false,
  walletAddress = "" 
}: LLMInterfaceProps) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [compiledTx, setCompiledTx] = useState<string | null>(null);
  
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'success' | 'failed'>('idle');
  const [txDigest, setTxDigest] = useState<string | null>(null);

  const SUGGESTED_PROMPTS = [
    { label: "🚀 Optimize 100 vSUI", text: "Take 100 vSUI and optimize my yields right now." },
    { label: "💎 Route 250 DEEP", text: "Route 250 DEEP tokens to the highest paying pool." },
    { label: "🦅 Check 50 HAWK", text: "Optimize my strategy using 50 HAWK tokens instantly." }
  ];

  const handleSelectSuggestion = (text: string) => {
    if (loading || txStatus === 'signing') return;
    setInput(text);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const controller = new AbortController();
    setLoading(true);
    setResponse('Routing prompt matrix to AlphaRoute Intent Kernel...');
    setCompiledTx(null);
    setTxStatus('idle');
    setTxDigest(null);

    // ✨ FEATURE 1: Read-Only Demo Mode Fallback Address
    // If the wallet isn't connected, we use a clean dummy address so the AI still runs perfectly!
    const activeSignerAddress = walletAddress || "0x0000000000000000000000000000000000000000000000000000000000000000";

    try {
      const res = await fetch("https://alpharoutebackend-production-40c9.up.railway.app/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: input,
          senderAddress: activeSignerAddress
        }),
      });

      if (!res.ok) {
        throw new Error(`Server network mismatch returned status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.reply);
      
      if (data.txData) {
        setCompiledTx(data.txData);
        setResponse(prev => `${prev}\n\n📦 [INTENT MATRIX COMPILED]\nProgrammable Transaction Block compiled successfully. Ready for signature authorization input.`);
      } else {
        setResponse(prev => `${prev}\n\nℹ️ System returned a text informational block. No on-chain operations were requested.`);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream request aborted.');
      } else {
        console.error('Terminal Submission Exception:', err);
        setResponse(`❌ Error capturing stream execution: ${err.message || 'Network response handshake failed'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeWalletTx = async () => {
    if (!compiledTx) {
      setResponse(prev => `${prev}\n❌ Cannot execute: No compiled transaction block found in local state workspace.`);
      return;
    }
    
    if (!onExecuteTransaction) {
      setResponse(prev => `${prev}\n❌ Interface configuration error: The parent wallet routing link callback is undefined.`);
      return;
    }
    
    setTxStatus('signing');
    setResponse(prev => `${prev}\n\n🔄 [SLUSH HANDSHAKE STARTED]\nOpening Slush Wallet extension wrapper... Please approve the transaction request.`);
    
    try {
      const digest = await onExecuteTransaction(compiledTx);
      setTxDigest(digest);
      setTxStatus('success');
      setResponse(prev => `${prev}\n\n✨ [CHAIN VERIFIED SUCCESS]\nTransaction Digest: ${digest}\nFunds successfully routed to optimal pools!`);
    } catch (error: any) {
      console.error("[Wallet Interface Crash]", error);
      setTxStatus('failed');
      setResponse(prev => `${prev}\n\n⚠️ [TRANSACTION DENIED]\nWallet signature authorization failed: ${error.message || 'Signature rejected or timed out'}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#18181b40', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.5rem', fontFamily: 'monospace' }}>
      {/* Console Display Screen */}
      <div style={{ backgroundColor: '#09090b', borderRadius: '#0.5rem', padding: '1rem', minHeight: '14rem', marginBottom: '1rem', border: '1px solid #18181b', whiteSpace: 'pre-wrap', color: '#34d399', fontSize: '0.875rem', overflowY: 'auto' }}>
        {response || '> System idle. Awaiting yield optimization execution strings...'}
      </div>

      {/* Dynamic Wallet Popup Controller Action Frame */}
      {compiledTx && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: txStatus === 'success' ? 'rgba(16, 185, 129, 0.08)' : txStatus === 'failed' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(52, 211, 153, 0.05)', border: `1px solid ${txStatus === 'success' ? '#10b98140' : txStatus === 'failed' ? '#ef444440' : '#34d39925'}`, borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: txStatus === 'success' ? '#10b981' : txStatus === 'failed' ? '#ef4444' : '#34d399' }}>
            {txStatus === 'idle' && "✨ Action Required: Sui PTB payload compiled to client memory matrix."}
            {txStatus === 'signing' && "🔗 Initializing Wallet Signatures... Checking Slush extension overlay loop..."}
            {txStatus === 'success' && `🚀 Success! Block Digest verified.`}
            {txStatus === 'failed' && "⚠️ Transaction compilation cancelled or dropped."}
          </div>
          
          {txStatus !== 'success' && txStatus !== 'signing' && (
            <div>
              {/* ✨ FEATURE 1: Smooth interactive button fallback styling for judges */}
              {isWalletConnected ? (
                <button
                  onClick={handleAuthorizeWalletTx}
                  style={{ backgroundColor: '#34d399', color: '#09090b', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'all 0.1s' }}
                >
                  APPROVE TRANSACTION ON-CHAIN →
                </button>
              ) : (
                <button
                  disabled
                  style={{ backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46', padding: '0.65rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center' }}
                >
                  🔒 CONNECT SLUSH WALLET TO SIGN ON-CHAIN
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input Form Action Row */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
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

      {/* Interactive Suggestion Pill Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingLeft: '0.25rem' }}>
        {SUGGESTED_PROMPTS.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelectSuggestion(suggestion.text)}
            disabled={loading || txStatus === 'signing'}
            style={{
              backgroundColor: '#27272a40',
              border: '1px solid #27272a',
              borderRadius: '2rem',
              padding: '0.35rem 0.85rem',
              color: '#a1a1aa',
              fontSize: '0.75rem',
              cursor: loading || txStatus === 'signing' ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading && txStatus !== 'signing') {
                e.currentTarget.style.borderColor = '#34d399';
                e.currentTarget.style.color = '#34d399';
                e.currentTarget.style.backgroundColor = '#34d39905';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#27272a';
              e.currentTarget.style.color = '#a1a1aa';
              e.currentTarget.style.backgroundColor = '#27272a40';
            }}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}