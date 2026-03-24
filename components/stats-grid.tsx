'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap, TrendingUp, Clock } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}

const stats: StatItem[] = [
  {
    label: 'Total Value Locked',
    value: '$8.2B',
    change: '+12.5%',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    label: '24h Volume',
    value: '$2.4B',
    change: '+8.3%',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: 'Your Liquidity',
    value: '$28,459',
    change: '+0.9%',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    label: 'Avg APY',
    value: '15.2%',
    change: '-2.1%',
    icon: <Clock className="h-5 w-5" />,
  },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.change && (
                  <p
                    className={`text-sm font-medium ${
                      stat.change.startsWith('+')
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}
                  >
                    {stat.change}
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-primary/20 p-3 text-primary">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
