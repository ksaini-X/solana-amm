use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
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
