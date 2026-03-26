"use client";

import { PoolsTable } from "@/components/pools-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePool } from "@/components/create-pool";
import useProgram from "@/hooks/useProgram";
import { getMint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Poller_One } from "next/font/google";
export interface RawPool {
  publicKey: string;
  account: {
    tokenAReserves: number;
    tokenBReserves: number;
    tokenAMint: string;
    tokenBMint: string;
    lpTokenMint: string;
    lpTokenSupply: number;
    tokenAMintDecimals: number;
    tokenBMintDecimals: number;
    lpTokenMintDecimals: number;
    tokenAVault: string;
    tokenBVault: string;
  };
}
export async function normalisePool(p: any, connection: Connection) {
  return {
    publicKey: p.publicKey.toString(),
    account: {
      tokenAReserves: p.account.tokenAReserves.toNumber(),
      tokenBReserves: p.account.tokenBReserves.toNumber(),
      tokenAVault: p.account.tokenAVault.toString(),
      tokenBVault: p.account.tokenBVault.toString(),
      tokenAMint: p.account.tokenAMint.toString(),
      tokenBMint: p.account.tokenBMint.toString(),
      lpTokenMint: p.account.lpTokenMint.toString(),
      lpTokenSupply: p.account.lpTokenSupply.toNumber(),
      tokenAMintDecimals: (await getMint(connection, p.account.tokenAMint))
        .decimals,
      tokenBMintDecimals: (await getMint(connection, p.account.tokenBMint))
        .decimals,
      lpTokenMintDecimals: (await getMint(connection, p.account.lpTokenMint))
        .decimals,
    },
  };
}

export default function PoolsPage() {
  const { connection } = useConnection();

  const [createPool, setCreatePool] = useState(false);
  const [loading, setLoading] = useState(false);
  const program = useProgram();

  const [pools, setPools] = useState<RawPool[]>([]);
  useEffect(() => {
    async function fetchPools() {
      if (!program) return;
      try {
        const allPools = await program.account.pool.all();
        console.log(
          allPools.map((t) => console.log(t.account.tokenAVault.toBase58())),
        );
        console.log(allPools[0].account.tokenAReserves.toNumber());
        const normalizedPromises = allPools.map((p: any) =>
          normalisePool(p, connection),
        );
        const normalized = await Promise.all(normalizedPromises);
        setPools(normalized);
      } catch (e) {
        console.error(e);
      }
    }
    fetchPools();
  }, [program]);
  console.log(pools);
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
