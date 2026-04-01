"use client";

import { PoolsTable } from "@/components/pools-table";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePool } from "@/components/create-pool";
import useProgram from "@/hooks/useProgram";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { RawPool, TokenInfo } from "@/lib/types";
import { normalisePool } from "@/lib/helper";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export default function PoolsPage() {
  const { connection } = useConnection();
  const program = useProgram();
  const wallet = useWallet();

  const [createPool, setCreatePool] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [pools, setPools] = useState<RawPool[]>([]);

  useEffect(() => {
    async function getAccountData() {
      if (!wallet.publicKey) return;
      setLoading(true);
      try {
        const data = await connection.getParsedTokenAccountsByOwner(
          wallet.publicKey,
          { programId: TOKEN_PROGRAM_ID },
        );
        console.log(data);
        const formatted: TokenInfo[] = data.value
          .map((acc) => ({
            tokenAccountAddress: acc.pubkey.toString(),
            tokenMintAddress: acc.account.data.parsed.info.mint,
            amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
            decimals: acc.account.data.parsed.info.tokenAmount.decimals,
          }))
          .filter((t) => t.amount > 0);

        setTokens(formatted);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    getAccountData();
  }, [wallet, connection]);

  useEffect(() => {
    async function fetchPools() {
      if (!program) return;
      setLoading(true);
      try {
        //@ts-ignore
        const allPools = await program.account.pool.all();
        const normalizedPromises = allPools.map((p: any) =>
          normalisePool(p, connection),
        );
        const normalized = await Promise.all(normalizedPromises);
        setPools(normalized);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
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
        <CreatePool
          loading={loading}
          setLoading={setLoading}
          pools={pools}
          tokens={tokens}
        />
      ) : (
        <PoolsTable
          loading={loading}
          setLoading={setLoading}
          pools={pools}
          tokens={tokens}
        />
      )}
    </main>
  );
}
