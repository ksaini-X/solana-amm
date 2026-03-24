"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface PoolData {
  id: string;
  tokens: string;
  tvl: string;
  apy: string;
  volume24h: string;
  fee: string;
}

const pools: PoolData[] = [
  {
    id: "eth-usdc",
    tokens: "ETH/USDC",
    tvl: "$2.4B",
    apy: "24.5%",
    volume24h: "$840M",
    fee: "0.30%",
  },
  {
    id: "eth-usdt",
    tokens: "ETH/USDT",
    tvl: "$1.8B",
    apy: "18.2%",
    volume24h: "$620M",
    fee: "0.30%",
  },
  {
    id: "usdc-usdt",
    tokens: "USDC/USDT",
    tvl: "$950M",
    apy: "8.5%",
    volume24h: "$450M",
    fee: "0.01%",
  },
  {
    id: "dai-usdc",
    tokens: "DAI/USDC",
    tvl: "750M",
    apy: "12.3%",
    volume24h: "$320M",
    fee: "0.05%",
  },
];

export function PoolsTable() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Liquidity Pools</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Earn fees by providing liquidity
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Liquidity</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  Pool
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  TVL
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  24h Volume
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  APY
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  Fee
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <tr
                  key={pool.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                          ◆
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs">
                          $
                        </div>
                      </div>
                      <span className="font-medium text-foreground">
                        {pool.tokens}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-foreground">
                    {pool.tvl}
                  </td>
                  <td className="px-4 py-4 text-right text-foreground">
                    {pool.volume24h}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Badge className="bg-primary/20 text-primary">
                      {pool.apy}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right text-muted-foreground text-sm">
                    {pool.fee}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border"
                    >
                      Deposit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
