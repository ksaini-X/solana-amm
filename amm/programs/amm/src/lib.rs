use anchor_lang::prelude::{borsh::{BorshDeserialize, BorshSerialize}, *};
use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface}, 
};

declare_id!("8spfEhrU1zhtirgszCB381fBvXqgsYnqpCG1RKEYwQM5");

#[program]
pub mod amm {


    use anchor_spl::token::{self, Transfer};

    use super::*;

    pub fn init_pool(ctx:Context<InitPool>, token_a_amount:u64, token_b_amount:u64)->Result<()>{

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
            Transfer{
                from:ctx.accounts.user_token_a_account.to_account_info(), 
                to:ctx.accounts.token_a_vault.to_account_info(), 
                authority:ctx.accounts.user.to_account_info()

        }), token_a_amount)?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
            Transfer{
                from:ctx.accounts.user_token_b_account.to_account_info(), 
                to:ctx.accounts.token_b_vault.to_account_info(), 
                authority:ctx.accounts.user.to_account_info()

        }), token_b_amount)?;

        let lp_amount = (token_a_amount.checked_mul(token_b_amount).unwrap() as f64).sqrt() as u64;

        token::mint_to(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            token::MintTo{
                authority:ctx.accounts.pool.to_account_info(), 
                mint:ctx.accounts.lp_mint.to_account_info(), 
                to:ctx.accounts.user.to_account_info(), 
        }, 
            &[&[
                b"pool", 
                ctx.accounts.token_a_mint.key().as_ref(), 
                ctx.accounts.token_b_mint.key().as_ref(), 
                &[ctx.bumps.pool]
            ]]), 
        lp_amount)?;

        ctx.accounts.pool.token_a_reserves = token_a_amount;
        ctx.accounts.pool.token_b_reserves = token_b_amount;
        ctx.accounts.pool.lp_token_supply = lp_amount;

        Ok(())
    }

    pub fn provide_liquidity(ctx:Context<ProvideLiquidity>, token_a_amount:u64, token_b_amount:u64)->Result<()>{
        let pool = &ctx.accounts.pool;
        // a/Ra == b/Rb  →  a * Rb == b * Ra

        let lhs = (token_a_amount as u128)
            .checked_mul(pool.token_b_reserves as u128).unwrap();
        let rhs = (token_b_amount as u128)
            .checked_mul(pool.token_a_reserves as u128).unwrap();

        let tolerance = rhs / 100;
        require!(
            lhs <= rhs + tolerance && lhs >= rhs - tolerance,
            CustomError::InvalidRatio
        );
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                token::Transfer{
                    authority:ctx.accounts.user.to_account_info(), 
                    from:ctx.accounts.user_token_a_account.to_account_info(), 
                    to:ctx.accounts.token_a_vault.to_account_info()
        }), token_a_amount)?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                token::Transfer{
                    authority:ctx.accounts.user.to_account_info(), 
                    from:ctx.accounts.user_token_b_account.to_account_info(), 
                    to:ctx.accounts.token_b_vault.to_account_info()
        }), token_b_amount)?;

        let lp_amount  =   token_a_amount.
                                checked_mul(ctx.accounts.pool.lp_token_supply).unwrap().
                                checked_div(ctx.accounts.pool.token_a_reserves).unwrap();

        token::mint_to(
            CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            token::MintTo { 
                mint: ctx.accounts.lp_mint.to_account_info(), 
                to: ctx.accounts.user_lp_token_account.to_account_info(), 
                authority: ctx.accounts.pool.to_account_info() 
            }, 
                &[&[
                b"pool", 
                ctx.accounts.token_a_mint.key().as_ref(), 
                ctx.accounts.token_b_mint.key().as_ref(), 
                &[ctx.bumps.pool]
             ]]), 
        lp_amount)?;

        let pool = &mut ctx.accounts.pool;
        pool.token_a_reserves = pool.token_a_reserves.checked_add(token_a_amount).unwrap();
        pool.token_b_reserves = pool.token_b_reserves.checked_add(token_b_amount).unwrap();
        pool.lp_token_supply  = pool.lp_token_supply.checked_add(lp_amount).unwrap();

        Ok(())
    }

    pub fn swap(ctx:Context<Swap>, in_amount:u64, swap_side:SwapSide)->Result<()>{
        let pool: &mut Account<'_, Pool> = &mut ctx.accounts.pool;
        match swap_side {
            SwapSide::AtoB =>{

                token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), token::Transfer{
                    authority:ctx.accounts.user.to_account_info(), 
                    from:ctx.accounts.user_token_a_account.to_account_info(), 
                    to:ctx.accounts.token_a_vault.to_account_info()
                }), in_amount)?;

                let out_amount = 
                pool.token_b_reserves.
                checked_mul(in_amount).unwrap().
                checked_div(
                    pool.token_a_reserves.
                    checked_add(in_amount).unwrap()
                ).unwrap();

                token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), token::Transfer{
                    authority:pool.to_account_info(), 
                    from:ctx.accounts.token_b_vault.to_account_info(), 
                    to:ctx.accounts.user_token_b_account.to_account_info()
                }, &[
                    &[
                        b"pool", 
                        ctx.accounts.token_a_mint.key().as_ref(), 
                        ctx.accounts.token_b_mint.key().as_ref(), 
                        &[ctx.bumps.pool]
                    ]
                ]), out_amount)?;

                pool.token_a_reserves = pool.token_a_reserves.checked_add(in_amount).unwrap();
                pool.token_b_reserves = pool.token_b_reserves.checked_sub(out_amount).unwrap();

            },
            SwapSide::BtoA =>{

                token::transfer(CpiContext::new(
                    ctx.accounts.token_program.to_account_info(), token::Transfer{
                        authority:ctx.accounts.user.to_account_info(), 
                        from:ctx.accounts.user_token_b_account.to_account_info(), 
                        to:ctx.accounts.token_b_vault.to_account_info()
                }), in_amount)?;

                let out_amount = 
                pool.token_a_reserves.
                checked_mul(in_amount).unwrap().
                checked_div(
                    pool.token_b_reserves.
                    checked_add(in_amount).unwrap()
                ).unwrap();

                token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), token::Transfer{
                    authority:pool.to_account_info(), 
                    from:ctx.accounts.token_a_vault.to_account_info(), 
                    to:ctx.accounts.user_token_a_account.to_account_info(),
                }, &[
                    &[
                        b"pool", 
                        ctx.accounts.token_a_mint.key().as_ref(), 
                        ctx.accounts.token_b_mint.key().as_ref(), 
                        &[ctx.bumps.pool]
                    ]
                ]), out_amount)?;

                pool.token_a_reserves = pool.token_a_reserves.checked_sub(out_amount).unwrap();
                pool.token_b_reserves = pool.token_b_reserves.checked_add(in_amount).unwrap();
            },
            
        }

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub token_a_reserves: u64,
    pub token_b_reserves: u64,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,

    pub lp_token_mint: Pubkey,
    pub lp_token_supply: u64,
    pub bump: u8,
}

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
        token::authority = pool
    )]
    pub token_a_vault:InterfaceAccount<'info, TokenAccount >, 

    #[account(
        init, 
        payer = user, 
        token::mint = token_b_mint, 
        token::authority = pool
    )]
    pub token_b_vault:InterfaceAccount<'info, TokenAccount >,

    #[account(
        init, 
        payer = user, 
        mint::decimals = 6, 
        mint::authority = pool
    )]
    pub lp_mint: InterfaceAccount<'info, Mint>, 

    #[account(
        init_if_needed, 
        payer  = user, 
        token::mint = lp_mint, 
        token::authority = user
    )]
    pub user_lp_token_account: InterfaceAccount<'info, TokenAccount>, 

    pub system_program:Program<'info, System>,
pub token_program: Interface<'info, TokenInterface>,    
pub rent : Sysvar<'info, Rent>

}


#[derive(Accounts)]
pub struct ProvideLiquidity<'info>{
    #[account(mut)]
    pub user : Signer<'info>, 

    #[account(mut)]
    pub token_a_mint: InterfaceAccount<'info, Mint>,
    pub token_b_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub user_token_a_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: InterfaceAccount<'info, TokenAccount>,

     #[account(
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()], 
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        token::mint = token_a_mint, 
        token::authority = pool
    )]
    pub token_a_vault:InterfaceAccount<'info, TokenAccount >, 

    #[account(
        token::mint = token_b_mint, 
        token::authority = pool
    )]
    pub token_b_vault:InterfaceAccount<'info, TokenAccount >,

    #[account(
        mint::decimals = 6, 
        mint::authority = pool
    )]
    pub lp_mint: InterfaceAccount<'info, Mint>, 

    #[account(
        init_if_needed, 
        payer  = user, 
        token::mint = lp_mint, 
        token::authority = user
    )]
    pub user_lp_token_account: InterfaceAccount<'info, TokenAccount>, 

    pub system_program:Program<'info, System>,
pub token_program: Interface<'info, TokenInterface>,
    pub rent : Sysvar<'info, Rent>
}

#[error_code]
pub enum CustomError{
    #[msg("Invalid Ration")]
    InvalidRatio
}
#[derive(BorshDeserialize, BorshSerialize, Clone, Copy)]
pub enum SwapSide{
    AtoB, 
    BtoA
}

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

    #[account(mut)]
    pub token_a_vault: InterfaceAccount<'info, TokenAccount>, 
    #[account(mut)]
    pub token_b_vault: InterfaceAccount<'info, TokenAccount>, 

    pub token_program: Interface<'info, TokenInterface>,

}