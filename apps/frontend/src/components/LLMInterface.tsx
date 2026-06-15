// apps/frontend/components/LLMInterface.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ---------- Explicit Native Styles Framework ----------
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '550px',
    width: '100%',
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    border: '1px solid #27272a',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    backgroundColor: '#18181b',
    borderBottom: '1px solid #27272a',
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  pulseDot: {
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 8px #10b981',
  },
  headerTitle: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#e4e4e7',
    letterSpacing: '0.05em',
  },
  headerMeta: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#71717a',
  },
  streamArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    backgroundColor: 'rgba(9, 9, 11, 0.2)',
  },
  messageRow: (role: 'user' | 'assistant' | 'system') => ({
    padding: '1rem',
    borderRadius: '0.75rem',
    border: '1px solid',
    maxWidth: '85%',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
    alignSelf: role === 'user' ? ('flex-end' as const) : ('flex-start' as const),
    backgroundColor: 
      role === 'user' ? '#18181b' : 
      role === 'system' ? 'rgba(153, 27, 27, 0.1)' : 'rgba(39, 39, 42, 0.3)',
    borderColor: 
      role === 'user' ? '#3f3f46' : 
      role === 'system' ? 'rgba(153, 27, 27, 0.3)' : '#27272a',
    color: 
      role === 'user' ? '#34d399' : 
      role === 'system' ? '#f87171' : '#d4d4d8',
  }),
  msgMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: '#71717a',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
  },
  loadingText: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#a1a1aa',
    paddingLeft: '0.5rem',
    fontStyle: 'italic',
  },
  inputForm: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#18181b',
    borderTop: '1px solid #27272a',
  },
  textField: {
    flex: 1,
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#f4f4f5',
    outline: 'none',
  },
  submitBtn: (disabled: boolean) => ({
    backgroundColor: disabled ? '#27272a' : '#f4f4f5',
    color: disabled ? '#71717a' : '#09090b',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0 1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
  })
};

export default function LLMInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'AlphaRoute Core LLM Active. Ready to optimize cross-protocol yields and monitor security vectors.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://alpharoutebackend-production-40c9.up.railway.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      if (!response.ok) throw new Error('Network response handshake failed');

      const data = await response.json();
      
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply || 'Execution completed with empty payload output.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'system',
        content: `Error capturing stream execution: ${error instanceof Error ? error.message : 'Unknown exception'}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Status Bar */}
      <div style={styles.header}>
        <div style={styles.statusGroup}>
          <div style={styles.pulseDot} />
          <span style={styles.headerTitle}>ALPHAROUTE // INTEL_AGENT_v1</span>
        </div>
        <span style={styles.headerMeta}>PROVIDER: LIVE_SUI_MAINNET</span>
      </div>

      {/* Messages Stream */}
      <div style={styles.streamArea}>
        {messages.map((msg, idx) => (
          <div key={idx} style={styles.messageRow(msg.role)}>
            <div style={styles.msgMeta}>
              <span>{msg.role}</span>
              <span>{msg.timestamp}</span>
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.loadingText}>
            Executing routing calculation matrix...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Terminal Input Box */}
      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AlphaRoute to aggregate yields or check transaction vectors..."
          style={styles.textField}
          disabled={isLoading}
        />
        <button
          type="submit"
          style={styles.submitBtn(isLoading || !input.trim())}
          disabled={isLoading || !input.trim()}
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
}