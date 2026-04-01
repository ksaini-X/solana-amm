
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self},
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use crate::{error::CustomError, state::Pool};

#[derive(Accounts)]
pub struct ProvideLiquidity<'info>{
    #[account(mut)]
    pub user : Signer<'info>, 

    pub token_a_mint: InterfaceAccount<'info, Mint>,
    pub token_b_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub user_token_a_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: InterfaceAccount<'info, TokenAccount>,

     #[account(
        mut, 
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()], 
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut, 
        token::mint = token_a_mint, 
        token::authority = pool
    )]
    pub token_a_vault:InterfaceAccount<'info, TokenAccount >, 

    #[account(
        mut, 
        token::mint = token_b_mint, 
        token::authority = pool
    )]
    pub token_b_vault:InterfaceAccount<'info, TokenAccount >,

    #[account(
        mut, 
        mint::decimals = 6, 
        mint::authority = pool
    )]
    pub lp_mint: InterfaceAccount<'info, Mint>, 

    #[account(
        init_if_needed, 
        payer  = user, 
        associated_token::mint = lp_mint,
        associated_token::authority = user,
    )]
    pub user_lp_token_account: Account<'info, token::TokenAccount>, 

    pub system_program:Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program : Program<'info, AssociatedToken>,

    pub rent : Sysvar<'info, Rent>
}

    pub fn handler(
        ctx: Context<ProvideLiquidity>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;

        let tolerance = 50; //0.5%
        let lhs = (token_a_amount as u128)
                         .checked_mul(pool.token_b_reserves as u128).unwrap();
        let rhs = (token_b_amount as u128)
                         .checked_mul(pool.token_a_reserves as u128).unwrap();
        let diff = if lhs > rhs { lhs - rhs } else { rhs - lhs };
        let max_diff = rhs.checked_mul(tolerance).unwrap() / 10_000;

        require!(diff <= max_diff, CustomError::InvalidRatio);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    authority: ctx.accounts.user.to_account_info(),
                    from: ctx.accounts.user_token_a_account.to_account_info(),
                    to: ctx.accounts.token_a_vault.to_account_info(),
                },
            ),
            token_a_amount,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    authority: ctx.accounts.user.to_account_info(),
                    from: ctx.accounts.user_token_b_account.to_account_info(),
                    to: ctx.accounts.token_b_vault.to_account_info(),
                },
            ),
            token_b_amount,
        )?;

        let lp_via_a = (token_a_amount as u128)
                            .checked_mul(pool.lp_token_supply as u128).unwrap()
                            .checked_div(pool.token_a_reserves as u128).unwrap() as u64;

        let lp_via_b = (token_b_amount as u128)
                            .checked_mul(pool.lp_token_supply as u128).unwrap()
                            .checked_div(pool.token_b_reserves as u128).unwrap() as u64;

        let lp_amount = lp_via_a.min(lp_via_b);

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    to: ctx.accounts.user_lp_token_account.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                &[&[
                    b"pool",
                    ctx.accounts.token_a_mint.key().as_ref(),
                    ctx.accounts.token_b_mint.key().as_ref(),
                    &[ctx.bumps.pool],
                ]],
            ),
            lp_amount,
        )?;

        let pool = &mut ctx.accounts.pool;
        pool.token_a_reserves = pool.token_a_reserves.checked_add(token_a_amount).unwrap();
        pool.token_b_reserves = pool.token_b_reserves.checked_add(token_b_amount).unwrap();
        pool.lp_token_supply = pool.lp_token_supply.checked_add(lp_amount).unwrap();

        Ok(())
    }