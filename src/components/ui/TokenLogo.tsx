'use client'

import { useState } from 'react'

// A few major coins are served as a flat monochrome glyph by Hyperliquid's CDN;
// override those with the colored brand logo (Hyperliquid shows the colored one).
const LOGO_OVERRIDE: Record<string, string> = {
  ETH: 'https://assets.coincap.io/assets/icons/eth@2x.png',
  XRP: 'https://assets.coincap.io/assets/icons/xrp@2x.png',
  NEAR: 'https://assets.coincap.io/assets/icons/near@2x.png',
}

// Ordered icon sources to try for a symbol. The Hyperliquid coin CDN is the
// authoritative source (covers HL-native tokens like PURR/HYPE); the override
// takes precedence where HL's icon is a poor monochrome glyph.
function sourcesFor(symbol: string): string[] {
  if (!symbol) return []
  const list: string[] = []
  if (LOGO_OVERRIDE[symbol]) list.push(LOGO_OVERRIDE[symbol])
  list.push(`https://app.hyperliquid.xyz/coins/${symbol}.svg`)
  return list
}

// Round token logo with a lettered fallback when no icon is available.
export function TokenLogo({ symbol, size }: { symbol: string; size: number }) {
  const [idx, setIdx] = useState(0)
  const [loadedSymbol, setLoadedSymbol] = useState(symbol)

  // The instance is reused across market switches (e.g. in the TopBar); reset
  // the source index whenever the symbol changes.
  if (symbol !== loadedSymbol) {
    setLoadedSymbol(symbol)
    setIdx(0)
  }

  const src = sourcesFor(symbol)[idx]
  if (!symbol || !src) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        className="rounded-full bg-bg-tertiary flex items-center justify-center font-bold text-text-secondary flex-shrink-0"
      >
        {symbol ? symbol[0] : '?'}
      </div>
    )
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      key={symbol + idx}
      src={src}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setIdx(i => i + 1)}
      className="rounded-full bg-bg-tertiary flex-shrink-0"
    />
  )
}
