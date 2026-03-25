import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const user = Keypair.generate();

  console.log("Requesting airdrop...");
  const airdropSignature = await connection.requestAirdrop(
    user.publicKey,
    2 * LAMPORTS_PER_SOL,
  );

  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });

  console.log("Airdrop confirmed.");
  const tokenKeypair = Keypair.generate();

  console.log("Creating mint...");
  const token = await createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    6,
    tokenKeypair,
  );

  console.log(`Token Mint Address: ${token.toBase58()}`);

  const userTokenAdd = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    token,
    new PublicKey("3vQLTrS4C1UvcvKvqwhe6HNPP5qBu9ETFo1Q4XtdA2Eg"),
    true,
    "confirmed",
  );

  const minttx = await mintTo(
    connection,
    user,
    token,
    userTokenAdd.address,
    user,
    10000 * 1_000_000,
  );

  const latestBlockHash1 = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash1.blockhash,
    lastValidBlockHeight: latestBlockHash1.lastValidBlockHeight,
    signature: minttx,
  });
}

main().catch(console.error);
