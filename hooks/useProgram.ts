import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "@/amm/target/idl/amm.json";
import { Amm } from "@/amm/target/types/amm";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
export default function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {});
    return new Program(idl as Amm, provider);
  }, [connection, wallet]);

  return program;
}
