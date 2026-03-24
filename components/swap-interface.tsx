"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, ChevronDown, Zap } from "lucide-react";

interface SwapToken {
  name: string;
  symbol: string;
  balance: string;
  icon: string;
}

const tokens: SwapToken[] = [
  { name: "Ethereum", symbol: "ETH", balance: "5.25", icon: "◆" },
  { name: "USDC", symbol: "USDC", balance: "10,250", icon: "$" },
  { name: "DAI", symbol: "DAI", balance: "8,500", icon: "⬠" },
];

export function SwapInterface() {
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("1845.32");

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Swap</span>
            <Zap className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              You pay
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-secondary text-lg font-semibold text-foreground placeholder:text-muted-foreground"
              />
              <Button variant="outline" className="gap-2 border-border">
                <span className="text-lg">◆</span>
                <span className="text-sm font-medium">ETH</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Balance: 5.25 ETH</p>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              size="icon"
              className="rounded-full border border-border bg-secondary hover:bg-secondary/80"
              variant="outline"
            >
              <ArrowDownUp className="h-5 w-5" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              You receive
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0"
                className="flex-1 bg-secondary text-lg font-semibold text-foreground"
              />
              <Button variant="outline" className="gap-2 border-border">
                <span className="text-lg">$</span>
                <span className="text-sm font-medium">USDC</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: 10,250 USDC
            </p>
          </div>

          {/* Price Info */}
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium text-foreground">
                1 ETH = $1,845.32
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slippage</span>
              <span className="font-medium text-foreground">0.5%</span>
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full bg-primary py-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90">
            Swap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
