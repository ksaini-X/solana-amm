'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface PortfolioData {
  icon: string;
  name: string;
  amount: string;
  value: string;
  change: string;
  changePercent: string;
}

const portfolio: PortfolioData[] = [
  {
    icon: '◆',
    name: 'Ethereum',
    amount: '5.25',
    value: '$9,688',
    change: '+$245',
    changePercent: '+2.6%',
  },
  {
    icon: '$',
    name: 'USDC',
    amount: '10,250',
    value: '$10,250',
    change: '+$0',
    changePercent: '0%',
  },
  {
    icon: '⬠',
    name: 'DAI',
    amount: '8,500',
    value: '$8,521',
    change: '+$12',
    changePercent: '+0.1%',
  },
];

export function PortfolioCard() {
  const totalValue = 28459;
  const totalChange = 257;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Portfolio</span>
          <TrendingUp className="h-5 w-5 text-primary" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Value */}
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
              <p className="mt-2 text-sm">
                <span className="text-primary font-medium">+${totalChange.toLocaleString()}</span>
                <span className="text-muted-foreground"> (+0.9%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Your Assets</h3>
          {portfolio.map((asset) => (
            <div
              key={asset.name}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold">
                  {asset.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.amount}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{asset.value}</p>
                <p className="text-xs text-primary">{asset.changePercent}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
