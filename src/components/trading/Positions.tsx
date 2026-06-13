'use client'

import { useAccount_HL } from '@/hooks/useAccountHL'
import { useWalletClient } from 'wagmi'
import { postExchange } from '@/lib/hyperliquid'
import { signOrder } from '@/lib/signing'
import { useState } from 'react'
import type { Position } from '@/lib/hyperliquid'

interface PositionsProps {
  markPrices: Record<string, number>
  meta: { universe: Array<{ name: string; szDecimals: number; maxLeverage: number }> }
}

function PositionRow({ pos, markPrice, assetIndex, walletClient, onClose }: {
  pos: Position
  markPrice: number
  assetIndex: number
  walletClient: unknown
  onClose: () => void
}) {
  const size = parseFloat(pos.szi)
  const entry = parseFloat(pos.entryPx)
  const pnl = parseFloat(pos.unrealizedPnl)
  const roe = parseFloat(pos.returnOnEquity) * 100
  const liq = pos.liquidationPx ? parseFloat(pos.liquidationPx) : null
  const isLong = size > 0
  const [closing, setClosing] = useState(false)

  async function closePosition() {
    if (!walletClient) return
    setClosing(true)
    try {
      const { action, nonce, signature } = await signOrder(walletClient as Parameters<typeof signOrder>[0], {
        coin: pos.coin,
        isBuy: !isLong,
        sz: Math.abs(size),
        reduceOnly: true,
      })
      const actionWithAsset = {
        ...action,
        orders: [{ ...(action as { orders: { a: number }[] }).orders[0], a: assetIndex }],
      }
      await postExchange(actionWithAsset, nonce, signature)
      setTimeout(onClose, 1000)
    } catch (e) {
      console.error('Close failed', e)
    } finally {
      setClosing(false)
    }
  }

  return (
    <tr className="border-b border-border-primary hover:bg-bg-hover text-xs">
      <td className="px-3 py-2 font-medium text-text-primary">{pos.coin}-PERP</td>
      <td className="px-3 py-2">
        <span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${isLong ? 'bg-long-bg text-long' : 'bg-short-bg text-short'}`}>
          {isLong ? 'Long' : 'Short'}
        </span>
      </td>
      <td className="px-3 py-2 font-mono text-text-secondary">{Math.abs(size).toFixed(4)}</td>
      <td className="px-3 py-2 font-mono text-text-secondary">
        ${entry.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
      </td>
      <td className="px-3 py-2 font-mono text-text-primary">
        ${markPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
      </td>
      <td className="px-3 py-2 font-mono text-short">
        {liq ? `$${liq.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}` : '—'}
      </td>
      <td className={`px-3 py-2 font-mono font-medium ${pnl >= 0 ? 'text-long' : 'text-short'}`}>
        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
        <span className="text-2xs ml-1 opacity-70">({roe >= 0 ? '+' : ''}{roe.toFixed(2)}%)</span>
      </td>
      <td className="px-3 py-2">
        <button
          onClick={closePosition}
          disabled={closing}
          className="text-2xs px-2 py-1 rounded border border-short/50 text-short hover:bg-short-bg transition-colors disabled:opacity-50"
        >
          {closing ? '...' : 'Close'}
        </button>
      </td>
    </tr>
  )
}

export function Positions({ markPrices, meta }: PositionsProps) {
  const { positions, openOrders, fills, totalPnl, refresh } = useAccount_HL()
  const { data: walletClient } = useWalletClient()
  const [tab, setTab] = useState<'positions' | 'orders' | 'history'>('positions')

  const tabs = [
    { key: 'positions', label: `Positions (${positions.length})` },
    { key: 'orders', label: `Open Orders (${(openOrders as unknown[]).length})` },
    { key: 'history', label: 'History' },
  ] as const

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border-primary flex-shrink-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs transition-colors ${
              tab === t.key
                ? 'text-text-primary border-b border-accent-blue -mb-px'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
        {positions.length > 0 && (
          <div className="ml-auto pr-3 text-xs">
            <span className="text-text-muted">Total PnL: </span>
            <span className={`font-mono font-medium ${totalPnl >= 0 ? 'text-long' : 'text-short'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'positions' && (
          positions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-text-muted">
              No open positions
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-2xs text-text-muted uppercase tracking-wider border-b border-border-primary">
                  {['Market', 'Side', 'Size', 'Entry', 'Mark', 'Liq. Price', 'PnL (ROE)', 'Action'].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => {
                  const assetIdx = meta.universe.findIndex(u => u.name === pos.coin)
                  return (
                    <PositionRow
                      key={pos.coin}
                      pos={pos}
                      markPrice={markPrices[pos.coin] || 0}
                      assetIndex={assetIdx}
                      walletClient={walletClient}
                      onClose={refresh}
                    />
                  )
                })}
              </tbody>
            </table>
          )
        )}

        {tab === 'orders' && (
          (openOrders as unknown[]).length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-text-muted">
              No open orders
            </div>
          ) : (
            <div className="p-3 text-xs text-text-secondary">
              {(openOrders as { coin: string; side: string; sz: string; limitPx: string; oid: number }[]).map((o, i) => (
                <div key={i} className="flex gap-4 py-1.5 border-b border-border-primary">
                  <span>{o.coin}</span>
                  <span className={o.side === 'B' ? 'text-long' : 'text-short'}>{o.side === 'B' ? 'Buy' : 'Sell'}</span>
                  <span className="font-mono">{o.sz}</span>
                  <span className="font-mono">${o.limitPx}</span>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'history' && (
          (fills as unknown[]).length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-text-muted">
              No trade history
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-2xs text-text-muted border-b border-border-primary">
                  {['Time', 'Market', 'Side', 'Size', 'Price', 'Fee'].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(fills as { time: number; coin: string; side: string; sz: string; px: string; fee: string }[]).slice(0, 50).map((f, i) => (
                  <tr key={i} className="border-b border-border-primary hover:bg-bg-hover text-xs">
                    <td className="px-3 py-1.5 text-text-muted">{new Date(f.time).toLocaleTimeString()}</td>
                    <td className="px-3 py-1.5 text-text-primary">{f.coin}-PERP</td>
                    <td className={`px-3 py-1.5 ${f.side === 'B' ? 'text-long' : 'text-short'}`}>{f.side === 'B' ? 'Buy' : 'Sell'}</td>
                    <td className="px-3 py-1.5 font-mono text-text-secondary">{f.sz}</td>
                    <td className="px-3 py-1.5 font-mono text-text-secondary">${f.px}</td>
                    <td className="px-3 py-1.5 font-mono text-text-muted">${parseFloat(f.fee).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
