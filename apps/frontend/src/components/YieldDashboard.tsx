"use client";

import { useEffect, useState, useMemo } from "react";

// ---------- Types ----------
interface Yield {
  id: string;
  symbol: string;
  apy: number;
  protocol: string;
  strategy: "lending" | "lp";
  tvl?: number;
}

// Mirroring the exact payload layout emitted by your Day 4 backend
interface BackendYieldRecord {
  apy: number;
  protocol: "Navi" | "Cetus";
  type: "lending" | "lp";
  metadata?: {
    pair?: string;
    tvl?: number;
  };
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

// ---------- Helpers ----------
const formatApy = (apy: number) => `${apy.toFixed(2)}%`;

const formatTvl = (tvl: number) => {
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`;
  return `$${tvl.toFixed(0)}`;
};

const PROTOCOL_STYLES: Record<string, string> = {
  navi: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
  cetus: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30",
};

const STRATEGY_STYLES: Record<string, string> = {
  lending: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  lp: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
};

// ---------- Component ----------
export default function YieldDashboard() {
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
        // Directing request to your live backend server running on port 3001
        const res = await fetch("http://127.0.0.1:3001/api/yields", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        
        const payload = await res.json();
        
        // Safety extraction matching your server response envelope: { success: true, data: { ... } }
        const rawMap: BackendYieldMap = payload.data || {};
        
        // Refactor Map layout from the backend structure into a flat Array for React consumption
        const flattenedYields: Yield[] = Object.entries(rawMap).flatMap(([symbol, records]) => 
          records.map((record, index) => ({
            id: `${symbol}-${record.protocol}-${index}`, // Guarantee unique element rendering keys
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

  // ---------- Error State ----------
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-500/30">
            <svg
              className="h-7 w-7 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-rose-100">
            Unable to load yields
          </h3>
          <p className="mt-2 text-sm text-rose-200/70">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 ring-1 ring-rose-500/30 transition hover:bg-rose-500/20"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ---------- Main Render ----------
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
              <svg
                className="h-5 w-5 text-zinc-950"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                AlphaRoute Yields
              </h1>
              <p className="text-sm text-zinc-400">
                Discover optimal routing paths across verified Sui protocols
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {tab.label}
                {!loading && tab.key !== "ALL" && (
                  <span
                    className={`ml-2 text-xs ${
                      isActive ? "text-zinc-500" : "text-zinc-600"
                    }`}
                  >
                    {yields.filter((y) => y.symbol === tab.key.toUpperCase()).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6"
              >
                <div className="mb-4 h-4 w-20 animate-pulse rounded bg-zinc-800" />
                <div className="mb-3 h-8 w-28 animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-800/60" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-zinc-800/60" />
              </div>
            ))}
          </div>
        ) : filteredYields.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 py-20 text-center">
            <p className="text-zinc-500">No yields available for this asset selection.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredYields.map((yield_) => {
              const protocolKey = yield_.protocol.toLowerCase();
              const protocolStyle =
                PROTOCOL_STYLES[protocolKey] ??
                "bg-zinc-500/10 text-zinc-300 ring-zinc-500/20";
              const strategyStyle =
                STRATEGY_STYLES[yield_.strategy] ??
                "bg-zinc-500/10 text-zinc-300 ring-zinc-500/20";

              return (
                <div
                  key={yield_.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-6 transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent" />

                  {/* Header row */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${protocolStyle}`}
                      >
                        {yield_.protocol}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase ring-1 ring-inset ${strategyStyle}`}
                      >
                        {yield_.strategy}
                      </span>
                    </div>
                    <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-700/50">
                      {yield_.symbol}
                    </span>
                  </div>

                  {/* APY Display */}
                  <div className="mb-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      APY
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-400">
                      {formatApy(yield_.apy)}
                    </p>
                  </div>

                  {/* Footer Context Info */}
                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
                    <div>
                      <p className="text-xs text-zinc-500">TVL</p>
                      <p className="text-sm font-semibold text-zinc-300">
                        {yield_.tvl != null && yield_.tvl > 0 ? formatTvl(yield_.tvl) : "—"}
                      </p>
                    </div>
                    <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 opacity-0 transition-all group-hover:opacity-100 hover:bg-white shadow-md">
                      Optimize →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}