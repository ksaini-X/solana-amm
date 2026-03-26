"use client";

import { StatsGrid } from "@/components/stats-grid";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Trade Crypto with Zero Slippage
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Vertex is a decentralized exchange platform powered by cutting-edge
          AMM technology. Swap tokens, provide liquidity, and earn yield.
        </p>
      </div>
      <div className="mb-12">
        <StatsGrid />
      </div>
    </main>
  );
}
