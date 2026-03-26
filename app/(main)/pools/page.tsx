"use client";

import { PoolsTable } from "@/components/pools-table";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePool } from "@/components/create-pool";
import useProgram from "@/hooks/useProgram";

export interface RawPool {
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

export default function PoolsPage() {
  const [createPool, setCreatePool] = useState(false);
  const [loading, setLoading] = useState(false);
  const program = useProgram();

  const [pools, setPools] = useState<RawPool[]>([]);

  useEffect(() => {
    async function fetchPools() {
      if (!program) return;
      try {
        const allPools = await program.account.pool.all();
        console.log(allPools);
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="">
          <h1 className="text-3xl font-bold text-foreground">
            Liquidity Pools
          </h1>
        </div>
        <Button className="gap-2" onClick={() => setCreatePool(!createPool)}>
          {!createPool ? (
            <>
              <Plus className="h-4 w-4" />
              <span className="px-1">Create Pool</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span className="px-1">Close</span>
            </>
          )}
        </Button>
      </div>
      {createPool ? (
        <CreatePool loading={loading} setLoading={setLoading} pools={pools} />
      ) : (
        <PoolsTable loading={loading} setLoading={setLoading} pools={pools} />
      )}
    </main>
  );
}
