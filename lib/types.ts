export interface RawPool {
  publicKey: string;
  account: {
    tokenAReserves: number;
    tokenBReserves: number;
    tokenAMint: string;
    tokenBMint: string;
    lpTokenMint: string;
    lpTokenSupply: number;
    tokenAMintDecimals: number;
    tokenBMintDecimals: number;
    lpTokenMintDecimals: number;
    tokenAVault: string;
    tokenBVault: string;
  };
}

export type TokenInfo = {
  tokenAccountAddress: string;
  tokenMintAddress: string;
  amount: number;
  decimals: number;
};
