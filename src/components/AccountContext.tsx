import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { db } from '../db/db'
import type { Account } from '../lib/types'

const STORAGE_KEY = 'activeAccountId'

interface AccountState {
  /** All accounts (including hidden ones), in display order. */
  accounts: Account[]
  active: Account
  setActiveId: (id: string) => void
}

const Ctx = createContext<AccountState | null>(null)

function readStoredId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const accounts = useLiveQuery(() => db.accounts.orderBy('order').toArray(), [])
  const [storedId, setStoredId] = useState<string | null>(readStoredId)

  const setActiveId = useCallback((id: string) => {
    setStoredId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch (err) {
      console.warn('could not remember the selected account', err)
    }
  }, [])

  const value = useMemo<AccountState | null>(() => {
    if (!accounts || accounts.length === 0) return null
    // Last selected account if it still exists and is visible, else the first visible one.
    const active =
      accounts.find((a) => a.id === storedId && !a.archived) ?? accounts.find((a) => !a.archived) ?? accounts[0]
    return { accounts, active, setActiveId }
  }, [accounts, storedId, setActiveId])

  if (!value) return null
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAccount(): AccountState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAccount must be used inside <AccountProvider>')
  return v
}
