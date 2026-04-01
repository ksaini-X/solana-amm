use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token::{self, Transfer}, 
    token_interface::{Mint, TokenAccount, TokenInterface}
};
use crate::state::Pool;
#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub token_a_mint: InterfaceAccount<'info, Mint>,
    pub token_b_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub user_token_a_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init, 
        payer = user, 
        space = 8 + Pool::INIT_SPACE, 
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()], 
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        init, 
        payer = user, 
        token::mint = token_a_mint, 
        token::authority = pool, 
        token::token_program = token_program  
    )]
    pub token_a_vault:InterfaceAccount<'info, TokenAccount >, 

    #[account(
        init, 
        payer = user, 
        token::mint = token_b_mint, 
        token::authority = pool,
        token::token_program = token_program, 

    )]
    pub token_b_vault:InterfaceAccount<'info, TokenAccount>,

    #[account(
        init, 
        payer = user, 
        mint::decimals = 6, 
        mint::authority = pool
    )]
    pub lp_mint: InterfaceAccount<'info, Mint>, 

    #[account(
        init, 
        payer  = user, 
        associated_token::mint = lp_mint, 
        associated_token::authority = user, 
    )]
    pub user_lp_token_account: InterfaceAccount<'info, TokenAccount>, 

    pub system_program:Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>, 
    pub associated_token_program : Program<'info, AssociatedToken>,
    pub rent : Sysvar<'info, Rent>

}

pub fn handler(
        ctx: Context<InitPool>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        ctx.accounts.pool.version = 1;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_a_account.to_account_info(),
                    to: ctx.accounts.token_a_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            token_a_amount,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_b_account.to_account_info(),
                    to: ctx.accounts.token_b_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            token_b_amount,
        )?;

        let lp_amount = (token_a_amount.checked_mul(token_b_amount).unwrap() as f64).sqrt() as u64;

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    authority: ctx.accounts.pool.to_account_info(),
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    to: ctx.accounts.user_lp_token_account.to_account_info(),
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

        ctx.accounts.pool.token_a_reserves = token_a_amount;
        ctx.accounts.pool.token_b_reserves = token_b_amount;

        ctx.accounts.pool.lp_token_supply = lp_amount;

        ctx.accounts.pool.token_a_mint = ctx.accounts.token_a_mint.key();
        ctx.accounts.pool.token_b_mint = ctx.accounts.token_b_mint.key();

        ctx.accounts.pool.lp_token_mint = ctx.accounts.lp_mint.key();

        ctx.accounts.pool.token_a_vault = ctx.accounts.token_a_vault.key();
        ctx.accounts.pool.token_b_vault = ctx.accounts.token_b_vault.key();

        Ok(())
    }