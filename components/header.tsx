"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, Settings } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <></>;
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            Ψ
          </div>
          <span className="text-xl font-bold text-foreground">Vertex</span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          <Link
            href="/pools"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pools
          </Link>
        </nav>

        <WalletMultiButton />
      </div>
    </header>
  );
}
