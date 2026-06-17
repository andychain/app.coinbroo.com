// ─── Coinbroo verified spot tokens ────────────────────────────────────────────
//
// This is Coinbroo's OWN allowlist, independent of Hyperliquid's `isCanonical`.
// A spot market shows in the "Strict" list if it is either:
//   • canonical on Hyperliquid (isCanonical = true — e.g. USDC, PURR), OR
//   • listed here (approved by Coinbroo).
//
// Hyperliquid's own "Strict" list is a curated allowlist they maintain
// off-chain — it is NOT exposed by the API (token names are globally unique, so
// there are no impersonators to filter, and isCanonical is true only for
// USDC/PURR). So to match Hyperliquid's default Strict view, the major
// non-canonical tokens HL curates are seeded below.
//
// To approve a new token later: add its base symbol (as shown in the market
// list, e.g. "UBTC", "HYPE") to this set. That's the only change needed.

export const COINBROO_VERIFIED_SPOT = new Set<string>([
  // Hyperliquid native
  'HYPE', 'KHYPE', 'PURR',

  // Unit-bridged real assets (Unit Bitcoin/Ethereum/Solana/…)
  'UBTC', 'UETH', 'USOL', 'UZEC', 'UXPL', 'UPUMP', 'UFART',
  'UMON', 'UENA', 'UBONK', 'UUUSPX', 'UVIRT',

  // Stablecoins
  'USDH', 'USDT0', 'USDE', 'USDHL', 'USDXL', 'FEUSD',

  // Commodities / majors
  'XAUT0', 'XMR1', 'KNTQ',
])
