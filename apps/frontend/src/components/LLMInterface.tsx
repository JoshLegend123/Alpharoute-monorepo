"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

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

  // Auto-scroll to latest logs/messages
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
      // Connects directly to your live production backend endpoint
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
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header Status Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm font-semibold tracking-wider text-slate-300">ALPHAROUTE // INTEL_AGENT_v1</span>
        </div>
        <span className="text-xs font-mono text-slate-500">PROVIDER: LIVE_SUI_MAINNET</span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm selection:bg-emerald-500/30">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-slate-900 border-slate-800 ml-auto text-emerald-400' 
                : msg.role === 'system'
                ? 'bg-rose-950/30 border-rose-900/50 text-rose-300 w-full max-w-full'
                : 'bg-slate-900/50 border-slate-800 mr-auto text-slate-300'
            }`}
          >
            <div className="flex justify-between items-center mb-1 opacity-50 text-xs">
              <span>{msg.role.toUpperCase()}</span>
              <span>{msg.timestamp}</span>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg mr-auto max-w-[85%] text-slate-400 font-mono animate-pulse">
            Executing routing calculation matrix...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Terminal Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AlphaRoute to aggregate yields or check transaction vectors..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono font-bold text-sm px-6 py-3 rounded-lg transition-colors"
          disabled={isLoading || !input.trim()}
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
}