'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { getUserState, getOpenOrders, getUserFills, type AccountState } from '@/lib/hyperliquid'

export function useAccount_HL() {
  const { address, isConnected } = useAccount()
  const [accountState, setAccountState] = useState<AccountState | null>(null)
  const [openOrders, setOpenOrders] = useState<unknown[]>([])
  const [fills, setFills] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!address || !isConnected) return
    setLoading(true)
    try {
      const [state, orders, userFills] = await Promise.all([
        getUserState(address),
        getOpenOrders(address),
        getUserFills(address),
      ])
      setAccountState(state)
      setOpenOrders(orders || [])
      setFills(userFills || [])
    } catch (e) {
      console.error('Failed to fetch account state', e)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [refresh])

  const positions = accountState?.assetPositions
    ?.filter(p => parseFloat(p.position.szi) !== 0)
    ?.map(p => p.position) || []

  const accountValue = parseFloat(accountState?.marginSummary?.accountValue || '0')
  const availableBalance = parseFloat(accountState?.withdrawable || '0')
  const totalPnl = positions.reduce((sum, p) => sum + parseFloat(p.unrealizedPnl), 0)

  return {
    accountState,
    positions,
    openOrders,
    fills,
    accountValue,
    availableBalance,
    totalPnl,
    loading,
    refresh,
  }
}
