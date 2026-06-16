'use client'

import { useState } from 'react'
import type { UnifiedMarket, MarketCategory } from '@/hooks/useMarkets'

interface MarketListProps {
  markets: UnifiedMarket[]
  selected: string
  onSelect: (coin: string) => void
}

function fmtPrice(p: number) {
  if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  if (p >= 1) return p.toFixed(3)
  return p.toFixed(5)
}

function fmtVol(n: number) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K'
  return '$' + n.toFixed(0)
}

const TAB_ORDER: (MarketCategory | 'All')[] = ['All', 'Perps', 'Spot', 'Outcome', 'Stocks', 'Other']

export function MarketList({ markets, selected, onSelect }: MarketListProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketCategory | 'All'>('All')

  // Only show tabs that have markets
  const available = TAB_ORDER.filter(t => t === 'All' || markets.some(m => m.category === t))

  let list = markets.filter(m => {
    const matchesCat = category === 'All' || m.category === category
    const q = search.toLowerCase()
    const matchesSearch = m.display.toLowerCase().includes(q) || m.coin.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })
  list = list.slice().sort((a, b) => b.volume24h - a.volume24h)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-2 py-2 border-b border-border-primary flex-shrink-0">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search markets..."
          className="w-full bg-bg-tertiary border border-border-primary rounded px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-secondary"
        />
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-primary flex-shrink-0 overflow-x-auto">
        {available.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-2 py-0.5 text-2xs rounded font-medium whitespace-nowrap transition-colors ${
              category === c ? 'bg-bg-hover text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Column labels */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border-primary flex-shrink-0">
        <span className="text-2xs text-text-muted uppercase tracking-wider">Market</span>
        <span className="text-2xs text-text-muted uppercase tracking-wider">Last / 24h</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <div className="flex items-center justify-center h-full text-2xs text-text-muted px-3 text-center">
            No markets
          </div>
        ) : (
          list.map(m => {
            const isUp = m.change24h >= 0
            const isSelected = m.coin === selected
            return (
              <button
                key={m.coin}
                onClick={() => onSelect(m.coin)}
                className={`w-full flex items-center justify-between px-2 py-1.5 border-b border-border-primary/40 transition-colors hover:bg-bg-hover text-left ${
                  isSelected ? 'bg-bg-hover border-l-2 border-l-accent-blue' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-text-primary truncate">{m.display}</span>
                    {m.maxLeverage > 0 && (
                      <span className="text-[8px] text-text-muted bg-bg-tertiary px-1 rounded leading-tight flex-shrink-0">{m.maxLeverage}x</span>
                    )}
                    {m.kind === 'spot' && (
                      <span className="text-[8px] text-accent-blue bg-bg-tertiary px-1 rounded leading-tight flex-shrink-0">SPOT</span>
                    )}
                  </div>
                  <p className="text-2xs text-text-muted mt-0.5">{fmtVol(m.volume24h)}</p>
                </div>
                <div className="text-right ml-1">
                  <p className="font-mono text-xs text-text-primary">${fmtPrice(m.price)}</p>
                  <p className={`text-2xs font-mono mt-0.5 ${isUp ? 'text-long' : 'text-short'}`}>
                    {isUp ? '+' : ''}{m.change24h.toFixed(2)}%
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
