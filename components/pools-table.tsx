"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRightLeft } from "lucide-react";
import { RawPool } from "@/app/(main)/pools/page";
import { useState } from "react";
import { SwapModal } from "./swap-interface";
import { DepositModal } from "./deposit-interface";

export const hexToNum = (hex: string) => parseInt(hex, 16);

export const shortAddr = (addr: string, offset?: number) =>
  `${addr.slice(0, offset || 10)}...${addr.slice(-1 * (offset || 10))}`;

function PoolCard({
  pool,
  setShowSwapModal,
  setShowDepositModal,
}: {
  pool: RawPool;
  setShowSwapModal: ({
    show,
    poolId,
  }: {
    show: boolean;
    poolId: string | null;
  }) => void;
  setShowDepositModal: ({
    show,
    poolId,
  }: {
    show: boolean;
    poolId: string | null;
  }) => void;
}) {
  const reserveA =
    pool.account.tokenAReserves / Math.pow(10, pool.account.tokenAMintDecimals);
  const reserveB =
    pool.account.tokenBReserves / Math.pow(10, pool.account.tokenBMintDecimals);
  const lpSupply =
    pool.account.lpTokenSupply / Math.pow(10, pool.account.lpTokenMintDecimals);

  const spotPrice = reserveA > 0 ? (reserveB / reserveA).toFixed(4) : "0";
  return (
    <Card
      className="group relative overflow-hidden border 
    border-border/60 bg-lienar-to-br from-card to-card/80 hover:shadow-xl 
    hover:shadow-primary/10 transition-all duration-300 rounded-2xl"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 
      transition bg-lienar-to-r from-primary/10 via-transparent to-primary/10"
      />

      <CardContent className="relative p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div
                className="h-9 w-9 flex items-center justify-center rounded-full 
              bg-primary/20 text-xs font-bold ring-2 ring-card"
              >
                A
              </div>
              <div
                className="h-9 w-9 flex items-center justify-center rounded-full 
              bg-primary/10 text-xs font-bold ring-2 ring-card"
              >
                B
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary font-semibold">
              {spotPrice} B/A
            </span>
          </div>
        </div>

        <div className="flex justify-between border-b border-neutral-800">
          <div className="rounded-xl bg-secondary/40 px-3 py-3">
            <p className="text-sm text-muted-foreground mb-1">Token A</p>
            <p className="font-mono text-2xl font-extrabold">{reserveA}</p>
          </div>

          <div className="rounded-xl bg-secondary/40 px-3 py-3">
            <p className="text-sm text-muted-foreground mb-1">Token B</p>
            <p className="font-mono text-2xl font-extrabold">{reserveB}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">LP Supply</p>
            <p className="font-mono text-xs text-muted-foreground">
              {lpSupply}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-border gap-1.5 hover:bg-primary/10"
              onClick={() =>
                setShowDepositModal({
                  poolId: pool.publicKey,
                  show: true,
                })
              }
            >
              <Plus className="h-3 w-3" />
              Deposit
            </Button>

            <Button
              size="sm"
              className="gap-1.5 bg-primary hover:bg-primary/90"
              onClick={() =>
                setShowSwapModal({
                  poolId: pool.publicKey,
                  show: true,
                })
              }
            >
              <ArrowRightLeft className="h-3 w-3" />
              Swap
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3 space-y-2">
          <div className="flex justify-between">
            <span>Token A</span>
            <span className="font-mono">
              {shortAddr(pool.account.tokenAMint)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Token B</span>
            <span className="font-mono">
              {shortAddr(pool.account.tokenBMint)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>LP Mint</span>
            <span className="font-mono">
              {shortAddr(pool.account.lpTokenMint)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Pool</span>
            <span className="font-mono">{shortAddr(pool.publicKey)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PoolsTable({
  loading,
  setLoading,
  pools,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  pools: RawPool[];
}) {
  const [showSwapModal, setShowSwapModal] = useState<{
    show: boolean;
    poolId: string | null;
  }>({
    show: false,
    poolId: null,
  });

  const [showDepositModal, setShowDepositModal] = useState<{
    show: boolean;
    poolId: string | null;
  }>({
    show: false,
    poolId: null,
  });
  return (
    <div className="space-y-4 relative">
      <div>
        {pools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pools.length > 0 &&
              pools.map((pool) => (
                <PoolCard
                  key={pool.publicKey}
                  pool={pool}
                  setShowSwapModal={setShowSwapModal}
                  setShowDepositModal={setShowDepositModal}
                />
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
      {showSwapModal.show && (
        <SwapModal
          onClose={() => setShowSwapModal({ poolId: null, show: false })}
          pool={pools.find((pool) => pool.publicKey === showSwapModal.poolId)!}
        />
      )}
      {showDepositModal.show && (
        <DepositModal
          onClose={() => setShowDepositModal({ poolId: null, show: false })}
          pool={
            pools.find((pool) => pool.publicKey === showDepositModal.poolId)!
          }
        />
      )}
    </div>
  );
}
