'use client'

import { useState } from 'react'

// Round token logo from Hyperliquid's coin-icon CDN, with a lettered fallback
// for coins that have no icon (or if the request fails).
export function TokenLogo({ symbol, size }: { symbol: string; size: number }) {
  const [errored, setErrored] = useState(false)
  const [loadedSymbol, setLoadedSymbol] = useState(symbol)

  // The instance is reused across market switches (e.g. in the TopBar), so reset
  // the error flag whenever the symbol changes — otherwise a prior token's error
  // would wrongly show the lettered fallback for a valid icon.
  if (symbol !== loadedSymbol) {
    setLoadedSymbol(symbol)
    setErrored(false)
  }

  if (!symbol || errored) {
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
      key={symbol}
      src={`https://app.hyperliquid.xyz/coins/${symbol}.svg`}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className="rounded-full bg-bg-tertiary flex-shrink-0"
    />
  )
}
