use anchor_lang::prelude::*;
use anchor_lang::{AnchorDeserialize, AnchorSerialize};

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy)]
pub enum SwapSide {
    AtoB,
    BtoA,
}
