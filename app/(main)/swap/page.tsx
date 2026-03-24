"use client";

import { Header } from "@/components/header";
import { SwapInterface } from "@/components/swap-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function SwapPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-2">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground">Token Swap</h1>
        <p className="mt-2 text-muted-foreground">Exchange tokens.</p>
      </div>

      <SwapInterface />
    </main>
  );
}
