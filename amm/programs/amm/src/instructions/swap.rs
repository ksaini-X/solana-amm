use anchor_lang::prelude::*;

use anchor_spl::{
    token, token_interface::{Mint, TokenAccount, TokenInterface}
};
use crate::state::{Pool, SwapSide};

#[derive(Accounts)]
pub struct Swap<'info>{

    #[account(mut)]
    pub user:Signer<'info>, 

    pub token_a_mint: InterfaceAccount<'info, Mint>,
    pub token_b_mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        mut, 
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()], 
        bump
    )]
    pub pool : Account<'info, Pool>,

    #[account(mut)]
    pub user_token_a_account : InterfaceAccount<'info, TokenAccount>, 
    #[account(mut)]
    pub user_token_b_account : InterfaceAccount<'info, TokenAccount>, 

    #[account(
        mut,
        token::mint = token_a_mint, 
        token::authority = pool
    )]
    pub token_a_vault: InterfaceAccount<'info, TokenAccount>, 
    #[account(
        mut,
        token::mint = token_b_mint, 
        token::authority = pool
    )]    pub token_b_vault: InterfaceAccount<'info, TokenAccount>, 

    pub token_program: Interface<'info, TokenInterface>,

}


 pub fn handler(ctx: Context<Swap>, in_amount: u64, swap_side: SwapSide) -> Result<()> {
        let pool: &mut Account<'_, Pool> = &mut ctx.accounts.pool;

        match swap_side {
            SwapSide::AtoB => {
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        token::Transfer {
                            authority: ctx.accounts.user.to_account_info(),
                            from: ctx.accounts.user_token_a_account.to_account_info(),
                            to: ctx.accounts.token_a_vault.to_account_info(),
                        },
                    ),
                    in_amount,
                )?;

                let out_amount = pool
                    .token_b_reserves
                    .checked_mul(in_amount)
                    .unwrap()
                    .checked_div(pool.token_a_reserves.checked_add(in_amount).unwrap())
                    .unwrap();

                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        token::Transfer {
                            authority: pool.to_account_info(),
                            from: ctx.accounts.token_b_vault.to_account_info(),
                            to: ctx.accounts.user_token_b_account.to_account_info(),
                        },
                        &[&[
                            b"pool",
                            ctx.accounts.token_a_mint.key().as_ref(),
                            ctx.accounts.token_b_mint.key().as_ref(),
                            &[ctx.bumps.pool],
                        ]],
                    ),
                    out_amount,
                )?;

                pool.token_a_reserves = pool.token_a_reserves.checked_add(in_amount).unwrap();
                pool.token_b_reserves = pool.token_b_reserves.checked_sub(out_amount).unwrap();
            }
            SwapSide::BtoA => {
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        token::Transfer {
                            authority: ctx.accounts.user.to_account_info(),
                            from: ctx.accounts.user_token_b_account.to_account_info(),
                            to: ctx.accounts.token_b_vault.to_account_info(),
                        },
                    ),
                    in_amount,
                )?;

                let out_amount = pool
                    .token_a_reserves
                    .checked_mul(in_amount)
                    .unwrap()
                    .checked_div(pool.token_b_reserves.checked_add(in_amount).unwrap())
                    .unwrap();

                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        token::Transfer {
                            authority: pool.to_account_info(),
                            from: ctx.accounts.token_a_vault.to_account_info(),
                            to: ctx.accounts.user_token_a_account.to_account_info(),
                        },
                        &[&[
                            b"pool",
                            ctx.accounts.token_a_mint.key().as_ref(),
                            ctx.accounts.token_b_mint.key().as_ref(),
                            &[ctx.bumps.pool],
                        ]],
                    ),
                    out_amount,
                )?;

                pool.token_a_reserves = pool.token_a_reserves.checked_sub(out_amount).unwrap();
                pool.token_b_reserves = pool.token_b_reserves.checked_add(in_amount).unwrap();
            }
        }

        Ok(())
    }