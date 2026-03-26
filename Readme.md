# SolAMM — Constant Product AMM on Solana

A demo Automated Market Maker (AMM) built on Solana devnet. Implements the constant product formula (`x * y = k`) for trustless token swaps and liquidity provision.

> ⚠️ **Testnet only.** This is a demo project. All tokens are test tokens with no real value. Fees are not implemented in the current version.

---

## Live Demo

**Network:** Solana Devnet  
**Program ID:** `<your_program_id_here>`

---

## How It Works

This AMM uses the **constant product formula**:

```
x * y = k
```

Where `x` and `y` are the reserves of Token A and Token B. Every swap preserves `k`, which automatically adjusts the price based on supply and demand. No oracle needed — the reserve ratio is the price.

### Spot Price

```
Spot Price of A (in terms of B) = reserveB / reserveA
```

### Swap Output

```
amountOut = reserveB - (k / (reserveA + amountIn))
```

---

## Features

### Instructions (On-Chain)

| Instruction        | Description                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `initPool`         | Create a new liquidity pool for any two SPL token mints. Seeds the initial reserves and mints LP tokens to the creator. |
| `provideLiquidity` | Deposit Token A and Token B into an existing pool. Receive LP tokens proportional to your share of the pool.            |
| `swap`             | Swap Token A for Token B or vice versa. Output amount is calculated via constant product math.                          |

### Frontend Pages

| Page         | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `/faucet`    | Mint test tokens directly to your wallet. Start here.              |
| `/pools`     | View all live pools — reserves, spot price, LP supply.             |
| `/swap`      | Swap tokens. See output amount and price impact before confirming. |
| `/liquidity` | Create a new pool or add liquidity to an existing one.             |

---

## Getting Started

### 1. Get Test Tokens

Go to the **Faucet** page and click **Get Token A / Get Token B** for whichever tokens you need. Tokens are minted directly to your connected wallet.

### 2. Create or Join a Pool

Head to **Liquidity → Create Pool**, select two tokens from your wallet, enter amounts, and confirm. The ratio you deposit sets the initial price.

To add to an existing pool, click **Deposit** on any pool card from the Pools page.

### 3. Swap

Go to **Swap**, select a pool, enter an amount, and see the exact output before confirming. Price impact is shown live.

---

## Local Development

```bash
git clone <repo>
cd solamm
npm install
npm run dev
```

Set your environment variables:

```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<your_program_id>
```

Make sure your wallet is set to **Devnet** in Phantom or Backpack.

---

## Program Architecture

```
programs/solamm/src/
├── lib.rs              # Instruction entrypoints
├── instructions/
│   ├── init_pool.rs    # Create pool, seed vaults, mint initial LP
│   ├── provide_liq.rs  # Add liquidity, mint LP tokens
│   └── swap.rs         # Constant product swap
└── state/
    └── pool.rs         # Pool account struct
```

### Pool Account

```rust
pub struct Pool {
    pub version: u8,
    pub token_a_reserves: u64,
    pub token_b_reserves: u64,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub lp_token_mint: Pubkey,
    pub lp_token_supply: u64,
    pub bump: u8,
}
```

---

## Not Implemented (Yet)

- Swap fees
- Remove liquidity
- Price charts / history
- Volume tracking
- Slippage tolerance setting

---

## Tech Stack

- **Solana** — Devnet
- **Anchor** — Program framework
- **Next.js + TypeScript** — Frontend
- **Wallet Adapter** — Phantom / Backpack support
- **shadcn/ui** — UI components
