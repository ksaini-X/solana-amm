"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { RawPool } from "@/app/(main)/pools/page";
import { shortAddr } from "./pools-table";
import useProgram from "@/hooks/useProgram";
import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

export function DepositModal({
  pool,
  onClose,
}: {
  pool: RawPool;
  onClose: () => void;
}) {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const program = useProgram();
  const wallet = useWallet();
  const {} = useConnection();
  const reserveA =
    pool.account.tokenAReserves / Math.pow(10, pool.account.tokenAMintDecimals);

  const reserveB =
    pool.account.tokenBReserves / Math.pow(10, pool.account.tokenBMintDecimals);

  const lpSupply =
    pool.account.lpTokenSupply / Math.pow(10, pool.account.lpTokenMintDecimals);

  const ratio = reserveA > 0 ? reserveB / reserveA : 0;

  // enforce ratio (A input drives B)
  useEffect(() => {
    if (!amountA || Number(amountA) <= 0) {
      setAmountB("");
      return;
    }

    const a = Number(amountA);
    const b = a * ratio;

    setAmountB(b.toFixed(6));
  }, [amountA]);

  async function handleDeposit() {
    if (!wallet.publicKey) return;

    const userTokenAAccount = await getAssociatedTokenAddress(
      new PublicKey(pool.account.tokenAMint),
      wallet.publicKey,
    );

    const userTokenBAccount = await getAssociatedTokenAddress(
      new PublicKey(pool.account.tokenBMint),
      wallet.publicKey,
    );

    const userLpTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(pool.account.lpTokenMint),
      wallet.publicKey,
    );

    console.log(userLpTokenAccount.toBase58());

    const amountAIn =
      Number(amountA) * Math.pow(10, pool.account.tokenAMintDecimals);

    const amountBIn =
      Number(amountB) * Math.pow(10, pool.account.tokenBMintDecimals);

    await program?.methods
      .provideLiquidity(new anchor.BN(amountAIn), new anchor.BN(amountBIn))
      .accounts({
        user: wallet.publicKey,
        tokenAMint: new PublicKey(pool.account.tokenAMint),
        tokenBMint: new PublicKey(pool.account.tokenBMint),
        userTokenAAccount,
        userTokenBAccount,
        userLpTokenAccount, // YOU MUST PASS THIS for init_if_needed
        tokenAVault: new PublicKey(pool.account.tokenAVault),
        tokenBVault: new PublicKey(pool.account.tokenBVault),
        lpMint: new PublicKey(pool.account.lpTokenMint),
        pool: new PublicKey(pool.publicKey),
        // Programs & Sysvars
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }

  const share = reserveA > 0 && amountA ? Number(amountA) / reserveA : 0;

  const estimatedLp = share * lpSupply;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xl z-50">
      <Card className="w-full max-w-md border-border bg-card rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Deposit</span>
            <X className="cursor-pointer" onClick={onClose} />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* TOKEN A */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Token A</p>

            <div className="flex gap-2">
              <Input
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                placeholder="0"
                className="bg-secondary text-lg font-semibold"
              />

              <div className="px-3 flex items-center rounded-lg bg-secondary text-sm font-medium gap-1">
                <span>A</span>
                <span className="text-muted-foreground text-xs">
                  {shortAddr(pool.account.tokenAMint, 4)}
                </span>
              </div>
            </div>
          </div>

          {/* TOKEN B (AUTO) */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Token B (auto)</p>

            <div className="flex gap-2">
              <Input
                value={amountB}
                readOnly
                placeholder="0"
                className="bg-secondary text-lg font-semibold"
              />

              <div className="px-3 flex items-center rounded-lg bg-secondary text-sm font-medium gap-1">
                <span>B</span>
                <span className="text-muted-foreground text-xs">
                  {shortAddr(pool.account.tokenBMint, 4)}
                </span>
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="rounded-xl bg-secondary/50 p-3 text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ratio</span>
              <span>1 A = {ratio.toFixed(6)} B</span>
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
              <span className="text-muted-foreground">Your Share</span>
              <span className="font-mono">{(share * 100).toFixed(4)}%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">LP Tokens</span>
              <span className="font-mono">{estimatedLp.toFixed(6)}</span>
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

          {/* ACTION */}
          <Button className="w-full text-lg py-6" onClick={handleDeposit}>
            Deposit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
