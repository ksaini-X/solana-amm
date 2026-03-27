"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, X } from "lucide-react";
import useProgram from "@/hooks/useProgram";
import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { shortAddr } from "@/lib/helper";
import { RawPool } from "@/lib/types";
export function SwapModal({
  pool,
  onClose,
}: {
  pool: RawPool;
  onClose: () => void;
}) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const program = useProgram();
  const wallet = useWallet();
  const {} = useConnection();

  const reserveA =
    pool.account.tokenAReserves / Math.pow(10, pool.account.tokenAMintDecimals);
  const reserveB =
    pool.account.tokenBReserves / Math.pow(10, pool.account.tokenBMintDecimals);
  const lpSupply =
    pool.account.lpTokenSupply / Math.pow(10, pool.account.lpTokenMintDecimals);

  const reserveIn = isReversed ? reserveB : reserveA;
  const reserveOut = isReversed ? reserveA : reserveB;

  useEffect(() => {
    if (!fromAmount || Number(fromAmount) <= 0) {
      setToAmount("");
      return;
    }

    const amountIn = Number(fromAmount);
    const out = (amountIn * reserveOut) / (reserveIn + amountIn);

    setToAmount(out.toFixed(6));
  }, [fromAmount, isReversed]);

  async function handleSwap() {
    const side = isReversed ? { aToB: {} } : { bToA: {} };
    if (!wallet.publicKey) return;
    const userTokenAAccount = await getAssociatedTokenAddress(
      new PublicKey(pool.account.tokenAMint),
      wallet.publicKey,
    );

    const userTokenBAccount = await getAssociatedTokenAddress(
      new PublicKey(pool.account.tokenBMint),
      wallet.publicKey,
    );
    const amount = isReversed
      ? Number(fromAmount) * Math.pow(10, pool.account.tokenBMintDecimals)
      : Number(fromAmount) * Math.pow(10, pool.account.tokenAMintDecimals);

    await program?.methods
      .swap(new anchor.BN(amount), isReversed ? { btoA: {} } : { atoB: {} })
      .accounts({
        user: wallet.publicKey!,
        tokenAMint: new PublicKey(pool.account.tokenAMint),
        tokenBMint: new PublicKey(pool.account.tokenBMint),
        userTokenAAccount,
        userTokenBAccount,
        tokenAVault: new PublicKey(pool.account.tokenAVault),
        tokenBVault: new PublicKey(pool.account.tokenBVault),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  const price = reserveA > 0 ? (reserveB / reserveA).toFixed(6) : "0";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xl z-50">
      <Card className="w-full max-w-md border-border bg-card rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Swap</span>
            <X className="cursor-pointer" onClick={onClose} />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">You pay</p>

            <div className="flex gap-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="bg-secondary text-lg font-semibold"
              />

              <div className="px-3 flex items-center rounded-lg bg-secondary text-sm font-medium gap-1">
                <span>{isReversed ? "B" : "A"}</span>
                <span className="text-muted-foreground text-xs">
                  {shortAddr(
                    isReversed
                      ? pool.account.tokenBMint
                      : pool.account.tokenAMint,
                    4,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              onClick={() => setIsReversed((p) => !p)}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">You receive</p>

            <div className="flex gap-2">
              <Input
                value={toAmount}
                readOnly
                placeholder="0"
                className="bg-secondary text-lg font-semibold"
              />

              <div className="px-3 flex items-center rounded-lg bg-secondary text-sm font-medium gap-1">
                <span>{isReversed ? "A" : "B"}</span>
                <span className="text-muted-foreground text-xs">
                  {shortAddr(
                    isReversed
                      ? pool.account.tokenAMint
                      : pool.account.tokenBMint,
                    4,
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3 text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>1 A = {price} B</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve A</span>
              <span className="font-mono">{reserveA}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve B</span>
              <span className="font-mono">{reserveB}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">LP Supply</span>
              <span className="font-mono">{lpSupply}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">LP Mint</span>
              <span className="font-mono text-xs">
                {shortAddr(pool.account.lpTokenMint)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Pool</span>
              <span className="font-mono text-xs">
                {shortAddr(pool.publicKey)}
              </span>
            </div>
          </div>

          <Button className="w-full text-lg py-6" onClick={handleSwap}>
            Swap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
