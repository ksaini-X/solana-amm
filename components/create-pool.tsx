"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Zap } from "lucide-react";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import useProgram from "@/hooks/useProgram";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { RawPool, TokenInfo } from "@/lib/types";

export function CreatePool({
  loading,
  setLoading,
  pools,
  tokens,
}: {
  loading: boolean;
  pools: RawPool[];
  setLoading: (loading: boolean) => void;
  tokens: TokenInfo[];
}) {
  const [mintA, setMintA] = useState("");
  const [mintB, setMintB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const wallet = useWallet();
  const { connection } = useConnection();
  const program = useProgram();

  const createPool = async () => {
    if (!program) return;
    if (!mintA || !mintB || !amountA || !amountB) {
      alert("Fill all fields");
      return;
    }

    if (mintA === mintB) {
      alert("Select two different tokens");
      return;
    }
    const poolExcists = pools.find(
      (pool) =>
        (pool.account.tokenAMint === mintA ||
          pool.account.tokenBMint === mintA) &&
        (pool.account.tokenAMint === mintB ||
          pool.account.tokenBMint === mintB),
    );
    if (poolExcists) {
      alert("Pool exists, Add liquidity instead");
      return;
    }
    const tokenAAccount = tokens.find((t) => t.tokenMintAddress === mintA);
    const tokenBAccount = tokens.find((t) => t.tokenMintAddress === mintB);
    if (!tokenAAccount || !tokenBAccount) return;
    if (
      Number(amountA) > tokenAAccount.amount ||
      Number(amountB) > tokenBAccount.amount
    ) {
      alert("Insufficent amount");
      return;
    }

    const tokenAVault = Keypair.generate();
    const tokenBVault = Keypair.generate();
    const lpMint = Keypair.generate();

    try {
      setLoading(true);
      const userLpTokenAccount = await getAssociatedTokenAddress(
        lpMint.publicKey,
        wallet.publicKey!,
      );
      console.log("userLpTokenAccount" + userLpTokenAccount.toString());
      const rawAmountA = Number(amountA) * Math.pow(10, tokenAAccount.decimals);
      const rawAmountB = Number(amountB) * Math.pow(10, tokenBAccount.decimals);
      let tx = await program.methods
        .initPool(new anchor.BN(rawAmountA), new anchor.BN(rawAmountB))
        .accounts({
          user: wallet.publicKey!,

          tokenAMint: new PublicKey(mintA),
          tokenBMint: new PublicKey(mintB),

          userTokenAAccount: new PublicKey(tokenAAccount!.tokenAccountAddress),
          userTokenBAccount: new PublicKey(tokenBAccount!.tokenAccountAddress),

          tokenAVault: tokenAVault.publicKey,
          tokenBVault: tokenBVault.publicKey,

          lpMint: lpMint.publicKey,

          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([tokenAVault, tokenBVault, lpMint])
        .rpc();
      await connection.confirmTransaction(tx, "confirmed");
      console.log(tx);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  console.log(tokens);
  const formatMint = (mint: string) =>
    `${mint.slice(0, 6)}...${mint.slice(-6)}`;

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create Pool
            <Zap className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Token A</label>
            <div className="flex gap-2">
              <select
                className="w-2/3 p-2 border rounded-md bg-background"
                value={mintA}
                onChange={(e) => setMintA(e.target.value)}
              >
                <option value="">Select token</option>
                {tokens.map((t) => (
                  <option
                    key={t.tokenAccountAddress}
                    value={t.tokenMintAddress}
                  >
                    {formatMint(t.tokenMintAddress)} ({t.amount})
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="w-1/3 p-2 border rounded-md"
                placeholder="Amount"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Token B</label>
            <div className="flex gap-2">
              <select
                className="w-2/3 p-2 border rounded-md bg-background"
                value={mintB}
                onChange={(e) => setMintB(e.target.value)}
              >
                <option value="">Select token</option>
                {tokens.map((t) => (
                  <option
                    key={t.tokenAccountAddress}
                    value={t.tokenMintAddress}
                  >
                    {formatMint(t.tokenMintAddress)} ({t.amount})
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="w-1/3 p-2 border rounded-md"
                placeholder="Amount"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={createPool}
            disabled={!mintA || !mintB || !amountA || !amountB || loading}
            className="w-full py-6 text-lg"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Create Pool"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
