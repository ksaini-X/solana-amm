"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

export function CreatePool() {
  const [mintA, setMintA] = useState("");
  const [mintB, setMintB] = useState("");

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateTokens = async () => {
    if (!mintA || !mintB) return;

    setLoading(true);

    setTimeout(() => {
      setIsValid(true);
      setLoading(false);
    }, 1000);
  };

  const createPool = () => {
    console.log({
      mintA,
      mintB,
      amountA,
      amountB,
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create Pool
            <Zap className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Token A Mint
            </label>
            <Input
              placeholder="Enter mint address"
              value={mintA}
              onChange={(e) => setMintA(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Token B Mint
            </label>
            <Input
              placeholder="Enter mint address"
              value={mintB}
              onChange={(e) => setMintB(e.target.value)}
            />
          </div>

          {!isValid && (
            <Button
              onClick={validateTokens}
              disabled={loading || !mintA || !mintB}
              className="w-full"
            >
              {loading ? "Checking..." : "Check Tokens"}
            </Button>
          )}

          {isValid && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Amount Token A
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amountA}
                  onChange={(e) => setAmountA(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Amount Token B
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amountB}
                  onChange={(e) => setAmountB(e.target.value)}
                />
              </div>

              <Button
                onClick={createPool}
                disabled={!amountA || !amountB}
                className="w-full py-6 text-lg"
              >
                Create Pool
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
