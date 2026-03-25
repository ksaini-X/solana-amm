import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Amm } from "../target/types/amm";
import {
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { min } from "bn.js";
describe("amm", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.amm as Program<Amm>;
  const user = provider.wallet;

  async function createDummyToken() {
    const newTokenKeypair = new anchor.web3.Keypair();
    const token = await createMint(
      provider.connection,
      provider.wallet.payer,
      user.publicKey,
      null,
      6,
      newTokenKeypair,
    );
    return token;
  }

  async function mintTokenToUser(mint: PublicKey) {
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      user.publicKey,
    );

    await mintTo(
      provider.connection,
      user.payer,
      mint,
      userTokenAccount.address,
      user.publicKey,
      1000000,
    );
  }

  it("Is initialized!", async () => {
    console.log(await provider.connection.getBalance(user.publicKey));
    const token1 = await createDummyToken();
    await mintTokenToUser(token1);
    const token2 = await createDummyToken();
    await mintTokenToUser(token2);

    const tx = await program.methods
      .initPool(new anchor.BN(100), new anchor.BN(200))
      .accounts({
        user: user.publicKey,
        tokenAMint: token1,
        tokenBMint: token2,
      })
      .rpc();
    const sig = await provider.connection.getConfirmedTransaction(
      tx,
      "confirmed",
    );

    console.log(sig);
  });
});
