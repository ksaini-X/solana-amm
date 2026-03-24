"use client";

import { Header } from "@/components/header";
import { PoolsTable } from "@/components/pools-table";
import { Button } from "@/components/ui/button";
import { Plus, Info, Cross, CrosshairIcon, X } from "lucide-react";
import { useState } from "react";
import { Close } from "@radix-ui/react-toast";
import { CreatePool } from "@/components/create-pool";

export default function PoolsPage() {
  const [createPool, setCreatePool] = useState(false);
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6">
        <div className="">
          <h1 className="text-3xl font-bold text-foreground">
            Liquidity Pools
          </h1>
        </div>
        <Button className="gap-2" onClick={() => setCreatePool(!createPool)}>
          {!createPool ? (
            <>
              <Plus className="h-4 w-4" />
              <span className="px-1">Create Pool</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span className="px-1">Close</span>
            </>
          )}
        </Button>
      </div>
      {createPool ? <CreatePool /> : <PoolsTable />}
    </main>
  );
}
