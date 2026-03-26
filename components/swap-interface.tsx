"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, X } from "lucide-react";
import { RawPool } from "@/app/(main)/pools/page";
import { formatReserve, hexToNum, shortAddr } from "./pools-table";

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

  const reserveA = hexToNum(pool.account.tokenAReserves);
  console.log(reserveA);
  const reserveB = hexToNum(pool.account.tokenBReserves);
  const lpSupply = hexToNum(pool.account.lpTokenSupply);

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
          {/* FROM */}
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

          {/* SWITCH */}
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

          {/* TO */}
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

          {/* INFO */}
          <div className="rounded-xl bg-secondary/50 p-3 text-sm space-y-3">
            {/* Price */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>1 A = {price} B</span>
            </div>

            {/* Reserves */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve A</span>
              <span className="font-mono">{formatReserve(reserveA)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve B</span>
              <span className="font-mono">{formatReserve(reserveB)}</span>
            </div>

            {/* LP */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">LP Supply</span>
              <span className="font-mono">{formatReserve(lpSupply)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">LP Mint</span>
              <span className="font-mono text-xs">
                {shortAddr(pool.account.lpTokenMint)}
              </span>
            </div>

            {/* Pool */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pool</span>
              <span className="font-mono text-xs">
                {shortAddr(pool.publicKey)}
              </span>
            </div>
          </div>

          {/* ACTION */}
          <Button className="w-full text-lg py-6">Swap</Button>
        </CardContent>
      </Card>
    </div>
  );
}
