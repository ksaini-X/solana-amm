"use client";

import { Header } from "@/components/header";
import { SwapInterface } from "@/components/swap-interface";
import { PoolsTable } from "@/components/pools-table";
import { StatsGrid } from "@/components/stats-grid";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Trade Crypto with Zero Slippage
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Vertex is a decentralized exchange platform powered by cutting-edge
          AMM technology. Swap tokens, provide liquidity, and earn yield.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-12">
        <StatsGrid />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Swap Interface */}
        <div className="lg:col-span-1">
          <SwapInterface />
        </div>

        {/* Right Column - Pools */}
        <div className="lg:col-span-2">
          <PoolsTable />
        </div>
      </div>
    </main>
  );
}
