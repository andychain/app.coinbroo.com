'use client'

import { useEffect, useState } from 'react'
import {
  getMetaAndAssetCtxs,
  getSpotMetaAndAssetCtxs,
  getPerpDexs,
} from '@/lib/hyperliquid'

export type MarketCategory = 'Perps' | 'Spot' | 'Outcome' | 'Stocks' | 'Other'

export interface UnifiedMarket {
  coin: string          // id used for l2Book / WS subscriptions
  display: string       // short label shown in UI
  category: MarketCategory
  price: number
  prevDayPx: number
  change24h: number
  volume24h: number
  funding: number
  openInterest: number
  maxLeverage: number
  szDecimals: number
  assetIndex: number    // core-perp universe index (for trading); -1 otherwise
  tradable: boolean     // only core perps are tradable in this build
  hasTvChart: boolean   // TradingView/Bybit symbol available
  kind: 'perp' | 'spot' | 'dex'
}

// Builder dex → category mapping
const DEX_CATEGORY: Record<string, MarketCategory> = {
  vntl: 'Outcome',   // Ventuals: OPENAI, ANTHROPIC, SPACEX...
  xyz: 'Stocks',
  flx: 'Stocks',
  km: 'Stocks',
  cash: 'Stocks',
  para: 'Stocks',
  hyna: 'Other',
  abcd: 'Other',
}

function num(s: string | undefined) { return s ? parseFloat(s) : 0 }

export function useMarkets() {
  const [markets, setMarkets] = useState<UnifiedMarket[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const results: UnifiedMarket[] = []

      // 1. Core perps
      try {
        const [meta, ctxs] = await getMetaAndAssetCtxs()
        meta.universe.forEach((u, i) => {
          const c = ctxs[i]
          if (!c || (u as { isDelisted?: boolean }).isDelisted) return
          const price = num(c.markPx)
          const prev = num(c.prevDayPx)
          results.push({
            coin: u.name,
            display: u.name,
            category: 'Perps',
            price,
            prevDayPx: prev,
            change24h: prev > 0 ? ((price - prev) / prev) * 100 : 0,
            volume24h: num(c.dayNtlVlm),
            funding: num(c.funding),
            openInterest: num(c.openInterest),
            maxLeverage: u.maxLeverage,
            szDecimals: u.szDecimals,
            assetIndex: i,
            tradable: true,
            hasTvChart: true,
            kind: 'perp',
          })
        })
      } catch { /* ignore */ }

      // 2. Spot
      try {
        const [spotMeta, spotCtxs] = await getSpotMetaAndAssetCtxs()
        spotMeta.universe.forEach((pair, i) => {
          const c = spotCtxs[i]
          if (!c) return
          const price = num(c.markPx)
          const prev = num(c.prevDayPx)
          const base = pair.name.split('/')[0]
          results.push({
            coin: c.coin || pair.name,
            display: base,
            category: 'Spot',
            price,
            prevDayPx: prev,
            change24h: prev > 0 ? ((price - prev) / prev) * 100 : 0,
            volume24h: num(c.dayNtlVlm),
            funding: 0,
            openInterest: 0,
            maxLeverage: 0,
            szDecimals: 2,
            assetIndex: -1,
            tradable: false,
            hasTvChart: false,
            kind: 'spot',
          })
        })
      } catch { /* ignore */ }

      // 3. Builder dexs (HIP-3): outcome, stocks, etc.
      try {
        const dexs = await getPerpDexs()
        const named = dexs.filter((d): d is { name: string; fullName: string } => !!d && !!d.name)
        await Promise.all(named.map(async (dex) => {
          try {
            const [meta, ctxs] = await getMetaAndAssetCtxs(dex.name)
            meta.universe.forEach((u, i) => {
              const c = ctxs[i]
              if (!c) return
              const price = num(c.markPx)
              const prev = num(c.prevDayPx)
              const display = u.name.includes(':') ? u.name.split(':')[1] : u.name
              results.push({
                coin: u.name,
                display,
                category: DEX_CATEGORY[dex.name] || 'Other',
                price,
                prevDayPx: prev,
                change24h: prev > 0 ? ((price - prev) / prev) * 100 : 0,
                volume24h: num(c.dayNtlVlm),
                funding: num(c.funding),
                openInterest: num(c.openInterest),
                maxLeverage: u.maxLeverage,
                szDecimals: u.szDecimals,
                assetIndex: -1,
                tradable: false,
                hasTvChart: false,
                kind: 'dex',
              })
            })
          } catch { /* ignore individual dex */ }
        }))
      } catch { /* ignore */ }

      if (!cancelled) setMarkets(results)
    }

    load()
    const interval = setInterval(load, 20000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return markets
}
