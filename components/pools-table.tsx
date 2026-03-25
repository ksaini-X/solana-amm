"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRightLeft } from "lucide-react";
import { useEffect, useState } from "react";
import useProgram from "@/hooks/useProgram";

interface RawPool {
  publicKey: string;
  account: {
    tokenAReserves: string;
    tokenBReserves: string;
    tokenAMint: string;
    tokenBMint: string;
    lpTokenMint: string;
    lpTokenSupply: string;
  };
}

const hexToNum = (hex: string) => parseInt(hex, 16);
const shortAddr = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
const formatReserve = (n: number) => {
  if (n / 1_000_000 >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n / 1_000_000 >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n / 1_000_000 >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toString();
};

function PoolCard({ pool }: { pool: RawPool }) {
  const reserveA = hexToNum(pool.account.tokenAReserves);
  const reserveB = hexToNum(pool.account.tokenBReserves);
  const lpSupply = hexToNum(pool.account.lpTokenSupply);
  const spotPrice = (reserveB / reserveA).toFixed(4);

  return (
    <Card className="border-border bg-card hover:bg-secondary/30 transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold ring-2 ring-card">
                A
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold ring-2 ring-card">
                B
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-muted-foreground mb-0.5">
              Spot Price
            </p>
            <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary font-semibold">
              {spotPrice}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/50 px-3 py-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">
              Reserve A
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {formatReserve(reserveA)}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">
              Reserve B
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {formatReserve(reserveB)}
            </p>
          </div>
        </div>

        {/* LP Supply + action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">
              LP Supply
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {formatReserve(lpSupply)}
            </p>
          </div>
          <Button size="sm" variant="outline" className="border-border gap-1.5">
            <Plus className="h-3 w-3" />
            Deposit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PoolsTable({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const program = useProgram();
  const [pools, setPools] = useState<RawPool[]>([]);

  useEffect(() => {
    async function fetchPools() {
      if (!program) return;
      try {
        const allPools = await program.account.pool.all();
        const normalized = allPools.map((p: any) => ({
          publicKey: p.publicKey.toString(),
          account: {
            tokenAReserves: p.account.tokenAReserves.toString(16),
            tokenBReserves: p.account.tokenBReserves.toString(16),
            tokenAVault: p.account.tokenAVault.toString(),
            tokenBVault: p.account.tokenBVault.toString(),
            tokenAMint: p.account.tokenAMint.toString(),
            tokenBMint: p.account.tokenBMint.toString(),
            lpTokenMint: p.account.lpTokenMint.toString(),
            lpTokenSupply: p.account.lpTokenSupply.toString(16),
          },
        }));
        setPools(normalized);
      } catch (e) {
        console.error(e);
      }
    }
    fetchPools();
  }, [program]);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Liquidity Pools
          </h2>
          <p className="text-sm text-muted-foreground">
            Provide liquidity and earn fees
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Liquidity</span>
        </Button>
      </div>

      {/* Pool cards grid */}
      {pools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <PoolCard key={pool.publicKey} pool={pool} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No pools found.</p>
          </div>
        )
      )}
    </div>
  );
}
