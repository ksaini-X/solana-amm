use anchor_lang::prelude::*;
use anchor_spl::token_interface::{TokenAccount, TokenInterface, Mint};
use anchor_spl::token;
use crate::state::Pool;


#[derive(Accounts)]
pub struct Withdraw<'info>{
    #[account(mut)]
    pub user : Signer<'info>, 

    pub token_a_mint: InterfaceAccount<'info, Mint>,
    pub token_b_mint: InterfaceAccount<'info, Mint>,
    pub lp_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut, 
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()], 
        bump
    )]
    pub pool : Account<'info, Pool>,

    #[account(mut)]
    pub user_token_a_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut, 
        token::mint = token_a_mint, 
        token::authority = pool
    )]
    pub token_a_vault_account :  InterfaceAccount<'info, TokenAccount>, 
    #[account(
        mut, 
        token::mint = token_b_mint, 
        token::authority = pool
    )]
    pub token_b_vault_account :  InterfaceAccount<'info, TokenAccount>, 

    #[account(
        mut, 
        token::mint = lp_mint, 
        token::authority = user
    )]
    pub user_lp_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,

}

    pub fn handler(ctx:Context<Withdraw>, lp_amount:u64)->Result<()>{
        let token_a_amount = lp_amount.
                                checked_mul(ctx.accounts.pool.token_a_reserves).unwrap().
                                checked_div(ctx.accounts.pool.lp_token_supply).unwrap();
        let token_b_amount = lp_amount.
                                checked_mul(ctx.accounts.pool.token_b_reserves).unwrap().
                                checked_div(ctx.accounts.pool.lp_token_supply).unwrap();

        token::burn(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), token::Burn{
                authority:ctx.accounts.user.to_account_info(), 
                from:ctx.accounts.user_lp_account.to_account_info(), 
                mint:ctx.accounts.lp_mint.to_account_info()
            }, 
&[
                &[
                    b"pool", 
                    ctx.accounts.token_a_mint.key().as_ref(),
                    ctx.accounts.token_b_mint.key().as_ref(),
                    &[ctx.bumps.pool]
                ]
            ]), lp_amount)?;

        token::transfer(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            token::Transfer{
                authority:ctx.accounts.pool.to_account_info(), 
                from:ctx.accounts.token_a_vault_account.to_account_info(), 
                to:ctx.accounts.user_token_a_account.to_account_info()
            }, &[
                &[
                    b"pool", 
                    ctx.accounts.token_a_mint.key().as_ref(),
                    ctx.accounts.token_b_mint.key().as_ref(),
                    &[ctx.bumps.pool]
                ]])
                , token_a_amount)?;


        token::transfer(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            token::Transfer{
                authority:ctx.accounts.pool.to_account_info(), 
                from:ctx.accounts.token_b_vault_account.to_account_info(), 
                to:ctx.accounts.user_token_b_account.to_account_info()
            }, &[
                &[
                    b"pool", 
                    ctx.accounts.token_a_mint.key().as_ref(),
                    ctx.accounts.token_b_mint.key().as_ref(),
                    &[ctx.bumps.pool]
                ]])
                , token_b_amount)?;

        ctx.accounts.pool.token_a_reserves = ctx.accounts.pool.token_a_reserves.checked_sub(token_a_amount).unwrap();
        ctx.accounts.pool.token_b_reserves = ctx.accounts.pool.token_b_reserves.checked_sub(token_a_amount).unwrap();
        ctx.accounts.pool.lp_token_supply = ctx.accounts.pool.lp_token_supply.checked_sub(lp_amount).unwrap();

        Ok(())
    }