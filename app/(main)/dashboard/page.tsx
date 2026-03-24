"use client";

import { Header } from "@/components/header";
import { PortfolioCard } from "@/components/portfolio-card";
import { StatsGrid } from "@/components/stats-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const recentTransactions = [
    {
      id: "1",
      type: "Swap",
      from: "ETH",
      to: "USDC",
      amount: "1.0",
      value: "$1,845",
      time: "2 hours ago",
      status: "Completed",
    },
    {
      id: "2",
      type: "Add",
      from: "ETH/USDC",
      pool: "Pool",
      amount: "$5,000",
      value: "$5,000",
      time: "1 day ago",
      status: "Completed",
    },
    {
      id: "3",
      type: "Swap",
      from: "DAI",
      to: "ETH",
      amount: "5,000",
      value: "$2.71",
      time: "3 days ago",
      status: "Completed",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your portfolio and track performance
        </p>
      </div>

      {/* Stats */}
      <div className="mb-12">
        <StatsGrid />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Portfolio */}
        <div className="lg:col-span-1">
          <PortfolioCard />
        </div>

        {/* Activity & History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-secondary">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="positions">Positions</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="mt-6">
                  <div className="space-y-4">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors border border-border"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold">
                            {tx.type === "Swap" ? "⇄" : "+"}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {tx.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {tx.type === "Swap"
                              ? `${tx.from} → ${tx.to}`
                              : tx.pool}
                          </p>
                          <p className="text-xs text-primary">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="positions" className="mt-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            ETH/USDC
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            0.5% fee tier
                          </p>
                        </div>
                        <p className="font-medium text-foreground">$12,500</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fees Earned</p>
                          <p className="text-primary font-medium">+$245</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">APY</p>
                          <p className="text-primary font-medium">24.5%</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            USDC/USDT
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            0.01% fee tier
                          </p>
                        </div>
                        <p className="font-medium text-foreground">$15,959</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fees Earned</p>
                          <p className="text-primary font-medium">+$12</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">APY</p>
                          <p className="text-primary font-medium">8.5%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">30 Day Return</span>
                    <span className="font-medium text-primary">+$892</span>
                  </div>
                  <div className="w-full bg-primary/20 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Total Fees</p>
                    <p className="text-lg font-bold text-primary mt-1">$257</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Avg APY</p>
                    <p className="text-lg font-bold text-primary mt-1">16.5%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
