'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = 'wss://api.hyperliquid.xyz/ws'

export interface OrderBookLevel {
  px: string
  sz: string
  n: number
}

export interface OrderBook {
  coin: string
  levels: [OrderBookLevel[], OrderBookLevel[]] // [bids, asks]
  time: number
}

export interface Trade {
  coin: string
  side: string
  px: string
  sz: string
  time: number
  tid: number
}

export interface AllMids {
  [coin: string]: string
}

interface UseHLWebSocketOptions {
  coins: string[]
  onOrderBook?: (data: OrderBook) => void
  onTrade?: (data: Trade[]) => void
  onAllMids?: (data: AllMids) => void
}

export function useHLWebSocket({ coins, onOrderBook, onTrade, onAllMids }: UseHLWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const [connected, setConnected] = useState(false)

  const subscribe = useCallback((ws: WebSocket) => {
    // Subscribe to order books for each coin
    coins.forEach(coin => {
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'l2Book', coin },
      }))
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'trades', coin },
      }))
    })

    // Subscribe to all mid prices
    ws.send(JSON.stringify({
      method: 'subscribe',
      subscription: { type: 'allMids' },
    }))
  }, [coins])

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      subscribe(ws)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (!msg.data) return

        if (msg.channel === 'l2Book') {
          onOrderBook?.(msg.data)
        } else if (msg.channel === 'trades') {
          onTrade?.(msg.data)
        } else if (msg.channel === 'allMids') {
          onAllMids?.(msg.data.mids)
        }
      } catch { /* ignore malformed messages */ }
    }

    ws.onclose = () => {
      setConnected(false)
      // Reconnect after 2s
      reconnectTimer.current = setTimeout(connect, 2000)
    }

    ws.onerror = () => ws.close()
  }, [subscribe, onOrderBook, onTrade, onAllMids])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected }
}
