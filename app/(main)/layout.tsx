"use client";
import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Header } from "@/components/header";
import "@solana/wallet-adapter-react-ui/styles.css";
const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ConnectionProvider
      endpoint={
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "http://127.0.0.1:8899"
      }
    >
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <Header />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default MainLayout;
