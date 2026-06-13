'use client'

import { useMemo } from 'react'
import type { OrderBookLevel } from '@/hooks/useHLWebSocket'

interface OrderBookProps {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  markPrice: number
  spread: number
}

function OBRow({
  level,
  side,
  maxSize,
}: {
  level: OrderBookLevel
  side: 'bid' | 'ask'
  maxSize: number
}) {
  const px = parseFloat(level.px)
  const sz = parseFloat(level.sz)
  const pct = maxSize > 0 ? (sz / maxSize) * 100 : 0
  const isBid = side === 'bid'

  return (
    <div className="relative flex justify-between items-center px-2.5 py-[2px] hover:bg-bg-hover cursor-default group">
      {/* Depth bar */}
      <div
        className={`absolute top-0 bottom-0 opacity-15 ${isBid ? 'bg-long right-0' : 'bg-short right-0'}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`font-mono text-xs z-10 ${isBid ? 'text-long' : 'text-short'}`}>
        {px >= 1000
          ? px.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
          : px.toFixed(4)}
      </span>
      <span className="font-mono text-xs text-text-secondary z-10">{sz.toFixed(4)}</span>
      <span className="font-mono text-2xs text-text-muted z-10 hidden group-hover:block">
        ${(px * sz).toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </span>
    </div>
  )
}

export function OrderBook({ bids, asks, markPrice, spread }: OrderBookProps) {
  const displayAsks = asks.slice(0, 10).reverse()
  const displayBids = bids.slice(0, 10)

  const maxSize = useMemo(() => {
    const allSizes = [...bids.slice(0, 10), ...asks.slice(0, 10)].map(l => parseFloat(l.sz))
    return Math.max(...allSizes, 0)
  }, [bids, asks])

  const spreadPct = markPrice > 0 ? ((spread / markPrice) * 100).toFixed(3) : '0.000'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between px-2.5 py-1.5 border-b border-border-primary">
        <span className="text-2xs text-text-muted uppercase tracking-wider">Price</span>
        <span className="text-2xs text-text-muted uppercase tracking-wider">Size</span>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Asks (sells) — shown top, reversed */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden">
          {displayAsks.map((level, i) => (
            <OBRow key={`ask-${i}`} level={level} side="ask" maxSize={maxSize} />
          ))}
        </div>

        {/* Spread */}
        <div className="flex justify-between items-center px-2.5 py-1 border-y border-border-primary bg-bg-tertiary">
          <span className="font-mono text-xs font-medium text-text-primary">
            ${markPrice > 0
              ? markPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              : '—'}
          </span>
          <span className="text-2xs text-text-muted">Spread {spreadPct}%</span>
        </div>

        {/* Bids (buys) */}
        <div className="flex-1 overflow-hidden">
          {displayBids.map((level, i) => (
            <OBRow key={`bid-${i}`} level={level} side="bid" maxSize={maxSize} />
          ))}
        </div>
      </div>
    </div>
  )
}
