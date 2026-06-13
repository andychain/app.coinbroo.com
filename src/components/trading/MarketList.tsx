'use client'

interface Market {
  name: string
  price: number
  change24h: number
  volume24h: number
  funding: number
}

interface MarketListProps {
  markets: Market[]
  selected: string
  onSelect: (coin: string) => void
}

export function MarketList({ markets, selected, onSelect }: MarketListProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-border-primary">
        <input
          type="text"
          placeholder="Search markets..."
          className="w-full bg-bg-tertiary border border-border-primary rounded-md px-2.5 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-secondary"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {markets.map(m => {
          const isUp = m.change24h >= 0
          const isSelected = m.name === selected
          return (
            <button
              key={m.name}
              onClick={() => onSelect(m.name)}
              className={`w-full flex items-center justify-between px-2.5 py-2 border-b border-border-primary/50 transition-colors hover:bg-bg-hover text-left ${
                isSelected ? 'bg-bg-hover border-l-2 border-l-accent-blue' : ''
              }`}
            >
              <div>
                <p className="text-xs font-medium text-text-primary">{m.name}-PERP</p>
                <p className={`text-2xs ${isUp ? 'text-long' : 'text-short'}`}>
                  {isUp ? '+' : ''}{m.change24h.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-text-primary">
                  ${m.price >= 1000
                    ? m.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    : m.price.toFixed(4)}
                </p>
                <p className="text-2xs text-text-muted">
                  f: <span className={m.funding >= 0 ? 'text-long' : 'text-short'}>
                    {m.funding >= 0 ? '+' : ''}{(m.funding * 100).toFixed(4)}%
                  </span>
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
