// ─── Coinbroo verified spot tokens ────────────────────────────────────────────
//
// This is Coinbroo's OWN allowlist, independent of Hyperliquid's `isCanonical`.
// A spot market shows in the "Strict" list if it is either:
//   • canonical on Hyperliquid (isCanonical = true), OR
//   • listed here (approved by Coinbroo).
//
// Most major Hyperliquid spot tokens (HYPE, UBTC, UETH, …) are NOT canonical on
// HL, so they must be approved here to appear in Strict mode.
//
// To approve a new token: add its base symbol (as shown in the market list,
// e.g. "UBTC", "HYPE") to this set. That's the only change needed.

export const COINBROO_VERIFIED_SPOT = new Set<string>([
  'HYPE',
  'UBTC',
  'UETH',
  'USOL',
  'UZEC',
  'USDH',
  'USDT0',
  'XAUT0',
  'UPUMP',
  'PURR',
])
