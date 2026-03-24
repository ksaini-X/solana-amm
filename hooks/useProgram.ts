import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "@/amm/target/idl/amm.json";
import { Amm } from "@/amm/target/types/amm";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
export default function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  if (!wallet) return;
  const provider = new AnchorProvider(connection, wallet);
  const program: Program<Amm> = new Program(idl, provider);

  return program;
}
