use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::SwapSide;

declare_id!("BU9jGP9ZBPXiPTbTGtTqt9BKVmmoVqZZ6JzkAvSAUxkA");
#[program]
pub mod amm {

    use super::*;

    pub fn init_pool(
        ctx: Context<InitPool>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        instructions::init_pool::handler(ctx, token_a_amount, token_b_amount)
    }

    pub fn provide_liquidity(
        ctx: Context<ProvideLiquidity>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        instructions::provide_liquidity::handler(ctx, token_a_amount, token_b_amount)
    }

    pub fn swap(ctx: Context<Swap>, in_amount: u64, swap_side: SwapSide) -> Result<()> {
        instructions::swap::handler(ctx, in_amount, swap_side)
    }
}
