'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWalletClient } from 'wagmi'
import { isNewUser, postExchange } from '@/lib/hyperliquid'
import { signApproveBuilderFee } from '@/lib/signing'

type OnboardState = 'idle' | 'checking' | 'approving' | 'done' | 'error' | 'dismissed'

const STORAGE_KEY = 'ht_builder_approved'

function getApprovedList(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function useOnboarding() {
  const { data: walletClient } = useWalletClient()
  const [state, setState] = useState<OnboardState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  const isApproved = useCallback((address: string): boolean => {
    return getApprovedList().includes(address.toLowerCase())
  }, [])

  const markApproved = useCallback((address: string) => {
    if (typeof window === 'undefined') return
    const list = getApprovedList()
    if (!list.includes(address.toLowerCase())) {
      list.push(address.toLowerCase())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
  }, [])

  const dismiss = useCallback(() => {
    setState('dismissed')
  }, [])

  const retry = useCallback(() => {
    setState('idle')
    setError(null)
  }, [])

  const runOnboarding = useCallback(async (address: string) => {
    if (!walletClient) return
    if (isApproved(address)) { setState('done'); return }
    if (state === 'checking' || state === 'approving' || state === 'dismissed') return

    setState('checking')
    setError(null)

    try {
      const newUser = await isNewUser(address)
      setIsNew(newUser)
      setState('approving')

      const { action, nonce, signature } = await signApproveBuilderFee(walletClient)
      const result = await postExchange(action, nonce, signature)

      if (result?.status === 'ok') {
        markApproved(address)
        setState('done')
      } else {
        throw new Error(JSON.stringify(result?.response) || 'ApproveBuilderFee failed')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      const isRejected = msg.includes('rejected') || msg.includes('denied') ||
        msg.includes('cancelled') || msg.includes('cancel') || msg.includes('User rejected')
      if (isRejected) {
        setState('idle')
      } else {
        setError(msg)
        setState('error')
      }
    }
  }, [walletClient, isApproved, markApproved, state])

  return { state, error, isNew, runOnboarding, isApproved, dismiss, retry }
}
