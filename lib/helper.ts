import { getMint } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";

export async function normalisePool(p: any, connection: Connection) {
  return {
    publicKey: p.publicKey.toString(),
    account: {
      tokenAReserves: p.account.tokenAReserves.toNumber(),
      tokenBReserves: p.account.tokenBReserves.toNumber(),
      tokenAVault: p.account.tokenAVault.toString(),
      tokenBVault: p.account.tokenBVault.toString(),
      tokenAMint: p.account.tokenAMint.toString(),
      tokenBMint: p.account.tokenBMint.toString(),
      lpTokenMint: p.account.lpTokenMint.toString(),
      lpTokenSupply: p.account.lpTokenSupply.toNumber(),
      tokenAMintDecimals: (await getMint(connection, p.account.tokenAMint))
        .decimals,
      tokenBMintDecimals: (await getMint(connection, p.account.tokenBMint))
        .decimals,
      lpTokenMintDecimals: (await getMint(connection, p.account.lpTokenMint))
        .decimals,
    },
  };
}

export const shortAddr = (addr: string, offset?: number) =>
  `${addr.slice(0, offset || 10)}...${addr.slice(-1 * (offset || 10))}`;
