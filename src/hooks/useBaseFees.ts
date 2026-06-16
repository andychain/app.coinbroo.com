'use client'

import { useEffect, useState } from 'react'
import { getBaseFees } from '@/lib/hyperliquid'

export function useBaseFees() {
  const [fees, setFees] = useState({ taker: 0.00045, maker: 0.00015 })
  useEffect(() => { getBaseFees().then(setFees).catch(() => {}) }, [])
  return fees
}
