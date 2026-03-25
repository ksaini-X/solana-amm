"use client";

import { PoolsTable } from "@/components/pools-table";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePool } from "@/components/create-pool";
import useProgram from "@/hooks/useProgram";
import { useWallet } from "@solana/wallet-adapter-react";

export default function PoolsPage() {
  const program = useProgram();
  const [pools, setPools] = useState([]);
  const wallet = useWallet();

  useEffect(() => {
    async function getPools() {
      if (!program) return;
      try {
        const allPools = await program.account.pool.all();
        console.log("calling");
        setPools(allPools);
      } catch (error) {
        console.log(error);
      }
    }
    getPools();
  }, [program]);

  console.log(pools);
  const [createPool, setCreatePool] = useState(false);
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6">
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
      {createPool ? <CreatePool /> : <PoolsTable />}
    </main>
  );
}
