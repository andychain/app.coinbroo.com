'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAccount_HL } from '@/hooks/useAccountHL'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Coinbroo'

interface TopBarProps {
  selectedMarket: string
  markPrice: number
  priceChange: number
  onMarketSelect?: () => void
}

export function TopBar({ selectedMarket, markPrice, priceChange }: TopBarProps) {
  const { isConnected } = useAccount()
  const { accountValue, totalPnl } = useAccount_HL()
  const isUp = priceChange >= 0

  return (
    <header className="h-11 flex items-center gap-3 px-3 bg-bg-secondary border-b border-border-primary flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded bg-accent-blue flex items-center justify-center">
          <span className="text-white text-xs font-bold">H</span>
        </div>
        <span className="text-text-primary font-semibold text-md hidden sm:block">{APP_NAME}</span>
      </div>

      {/* Market + price */}
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-medium text-base">{selectedMarket}-PERP</span>
        <span className={`font-mono text-base font-medium ${isUp ? 'text-long' : 'text-short'}`}>
          ${markPrice > 0 ? markPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${isUp ? 'bg-long-bg text-long' : 'bg-short-bg text-short'}`}>
          {isUp ? '+' : ''}{priceChange.toFixed(2)}%
        </span>
      </div>

      {/* Account summary (when connected) */}
      {isConnected && accountValue > 0 && (
        <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-border-primary">
          <div>
            <span className="text-text-muted text-xs">Balance </span>
            <span className="text-text-primary text-xs font-mono font-medium">
              ${accountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-text-muted text-xs">PnL </span>
            <span className={`text-xs font-mono font-medium ${totalPnl >= 0 ? 'text-long' : 'text-short'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Wallet connect */}
      <ConnectButton
        showBalance={false}
        chainStatus="none"
        accountStatus="avatar"
      />
    </header>
  )
}
