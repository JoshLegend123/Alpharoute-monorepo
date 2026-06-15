// apps/frontend/src/app/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { ConnectButton } from '@mysten/dapp-kit';

// ---------- Types ----------
interface Yield {
  id: string;
  symbol: string;
  apy: number;
  protocol: string;
  strategy: "lending" | "lp";
  tvl?: number;
}

interface BackendYieldRecord {
  apy: number;
  protocol: "Navi" | "Cetus";
  type: "lending" | "lp";
  metadata?: { pair?: string; tvl?: number; };
}

interface BackendYieldMap {
  [assetSymbol: string]: BackendYieldRecord[];
}

type TabKey = "ALL" | "SUI" | "vSUI" | "USDC";

const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "All Assets" },
  { key: "SUI", label: "SUI" },
  { key: "vSUI", label: "vSUI" },
  { key: "USDC", label: "USDC" },
];

// ---------- Inline Native Styles Framework ----------
const styles = {
  main: { backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, fontFamily: 'sans-serif' },
  nav: { borderBottom: '1px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', height: '5rem', maxWidth: '80rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' as const },
  logoBox: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logoBadge: { background: 'linear-gradient(to bottom right, #34d399, #06b6d4)', width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', color: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '-1px' },
  logoText: { fontSize: '1.25rem', fontWeight: 'bold', trackingTight: '-0.025em' },
  contentWrapper: { maxWidth: '80rem', width: '100%', margin: '0 auto', padding: '2.5rem 2rem', flex: 1, boxSizing: 'border-box' as const },
  title: { fontSize: '1.875rem', fontWeight: 'bold', margin: 0, color: '#ffffff' },
  subtitle: { fontSize: '0.875rem', color: '#a1a1aa', marginTop: '0.25rem', marginBottom: '2.5rem' },
  tabsRow: { display: 'flex', gap: '0.5rem', borderBottom: '1px solid #18181b', paddingBottom: '0.75rem', marginBottom: '2rem', overflowX: 'auto' as const },
  tabBtn: (active: boolean) => ({
    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #27272a', cursor: 'pointer', transition: 'all 0.2s',
    backgroundColor: active ? '#f4f4f5' : '#18181b',
    color: active ? '#09090b' : '#a1a1aa'
  }),
  grid: { display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' },
  card: { backgroundColor: 'rgba(24, 24, 27, 0.4)', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', minHeight: '12rem', position: 'relative' as const },
  badgeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  badgeGroup: { display: 'flex', gap: '0.37rem' },
  protocolBadge: (p: string) => ({
    padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500, border: '1px solid rgba(63,63,70,0.4)',
    backgroundColor: p === 'navi' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)',
    color: p === 'navi' ? '#a5b4fc' : '#67e8f9'
  }),
  strategyBadge: (s: string) => ({
    padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' as const, border: '1px solid rgba(63,63,70,0.4)',
    backgroundColor: s === 'lending' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    color: s === 'lending' ? '#34d399' : '#fbbf24'
  }),
  symbolTag: { fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', backgroundColor: '#27272a', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' },
  apyLabel: { fontSize: '0.65rem', fontWeight: 'bold', color: '#71717a', letterSpacing: '0.05em' },
  apyValue: { fontSize: '1.875rem', fontWeight: 800, color: '#34d399', margin: '0.125rem 0 0 0' },
  footerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '1rem', marginTop: '1rem' },
  tvlLabel: { fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase' as const },
  tvlValue: { fontSize: '0.875rem', fontWeight: 'bold', color: '#e4e4e7', margin: '0.125rem 0 0 0' },
  optBtn: { backgroundColor: '#f4f4f5', color: '#09090b', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' },
  statusMessage: { padding: '3rem', textAlign: 'center' as const, color: '#71717a', border: '1px dashed #27272a', borderRadius: '1rem' }
};

export default function Home() {
  const [yields, setYields] = useState<Yield[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  useEffect(() => {
    const controller = new AbortController();
    const fetchYields = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://127.0.0.1:3001/api/yields", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        
        const payload = await res.json();
        const rawMap: BackendYieldMap = payload.data || {};
        
        const flattenedYields: Yield[] = Object.entries(rawMap).flatMap(([symbol, records]) => 
          records.map((record, index) => ({
            id: `${symbol}-${record.protocol}-${index}`,
            symbol: symbol.toUpperCase(),
            apy: record.apy,
            protocol: record.protocol,
            strategy: record.type,
            tvl: record.metadata?.tvl
          }))
        );

        setYields(flattenedYields);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to fetch yields");
      } finally {
        setLoading(false);
      }
    };

    fetchYields();
    return () => controller.abort();
  }, []);

  const filteredYields = useMemo(() => {
    if (activeTab === "ALL") return yields;
    return yields.filter((y) => y.symbol === activeTab.toUpperCase());
  }, [yields, activeTab]);

  return (
    <main style={styles.main}>
      {/* Top Navigation Header bar */}
      <nav style={styles.nav}>
        <div style={styles.logoBox}>
          <div style={styles.logoBadge}>αR</div>
          <span style={styles.logoText}>AlphaRoute</span>
        </div>
        <div>
          <ConnectButton />
        </div>
      </nav>

      {/* Primary Dashboard Container */}
      <div style={styles.contentWrapper}>
        <header>
          <h1 style={styles.title}>Yield Opportunities</h1>
          <p style={styles.subtitle}>Discover optimal routing paths across verified Sui protocols</p>
        </header>

        {/* Assets Filter Tab Selector */}
        <div style={styles.tabsRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={styles.tabBtn(isActive)}
              >
                {tab.label}
                {!loading && tab.key !== "ALL" && (
                  <span style={{ marginLeft: '0.35rem', opacity: 0.6 }}>
                    ({yields.filter((y) => y.symbol === tab.key.toUpperCase()).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Cards Layout Feed Grid */}
        {loading ? (
          <div style={styles.statusMessage}>Loading dynamic routing matrix from on-chain pools...</div>
        ) : error ? (
          <div style={{ ...styles.statusMessage, border: '1px solid #7f1d1d', color: '#f87171', backgroundColor: '#7f1d1d10' }}>
            {error}
          </div>
        ) : filteredYields.length === 0 ? (
          <div style={styles.statusMessage}>No active optimization lanes available for this asset type.</div>
        ) : (
          <div style={styles.grid}>
            {filteredYields.map((yield_) => {
              const pKey = yield_.protocol.toLowerCase();
              return (
                <div key={yield_.id} style={styles.card}>
                  <div>
                    <div style={styles.badgeRow}>
                      <div style={styles.badgeGroup}>
                        <span style={styles.protocolBadge(pKey)}>{yield_.protocol}</span>
                        <span style={styles.strategyBadge(yield_.strategy)}>{yield_.strategy}</span>
                      </div>
                      <span style={styles.symbolTag}>{yield_.symbol}</span>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <div style={styles.apyLabel}>APY</div>
                      <div style={styles.apyValue}>{yield_.apy.toFixed(2)}%</div>
                    </div>
                  </div>

                  <div style={styles.footerRow}>
                    <div>
                      <div style={styles.tvlLabel}>TVL Context</div>
                      <div style={styles.tvlValue}>
                        {yield_.tvl && yield_.tvl > 0 ? `$${(yield_.tvl / 1_000_000).toFixed(2)}M` : "—"}
                      </div>
                    </div>
                    <button style={styles.optBtn}>Optimize →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}