import { newId } from '../lib/id'
import Dexie, { type EntityTable } from 'dexie'
import type { Account, Category, Transaction } from '../lib/types'

export const DEFAULT_ACCOUNT_NAME = 'บัญชีเริ่มต้น'

export const newDefaultAccount = (): Account => ({
  id: newId(),
  name: DEFAULT_ACCOUNT_NAME,
  icon: '👛',
  color: '#3b82f6',
  archived: false,
  order: 0,
})

class AppDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>

  constructor() {
    super('expense-tracker')
    this.version(1).stores({
      categories: 'id, type, order',
      transactions: 'id, date, type, categoryId',
    })
    // v2: accounts. Existing transactions move into a default account.
    this.version(2)
      .stores({
        accounts: 'id, order',
        categories: 'id, type, order',
        transactions: 'id, date, type, categoryId, accountId',
      })
      .upgrade(async (tx) => {
        const account = newDefaultAccount()
        await tx.table('accounts').add(account)
        await tx.table('transactions').toCollection().modify({ accountId: account.id })
      })
  }
}

export const db = new AppDB()

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'archived' | 'order'>[] = [
  { type: 'expense', name: 'อาหาร', icon: '🍜', color: '#f97316' },
  { type: 'expense', name: 'เดินทาง', icon: '🚌', color: '#3b82f6' },
  { type: 'expense', name: 'ค่าของ', icon: '🛒', color: '#a855f7' },
  { type: 'expense', name: 'บิล/ค่าเช่า', icon: '🧾', color: '#ef4444' },
  { type: 'expense', name: 'สุขภาพ', icon: '💊', color: '#14b8a6' },
  { type: 'expense', name: 'บันเทิง', icon: '🎬', color: '#ec4899' },
  { type: 'expense', name: 'อื่น ๆ', icon: '📦', color: '#64748b' },
  { type: 'income', name: 'เงินเดือน', icon: '💼', color: '#22c55e' },
  { type: 'income', name: 'ฟรีแลนซ์', icon: '💻', color: '#06b6d4' },
  { type: 'income', name: 'ของขวัญ', icon: '🎁', color: '#eab308' },
  { type: 'income', name: 'อื่น ๆ', icon: '💰', color: '#64748b' },
]

/** Seeds default categories on first run only. Safe to call repeatedly. */
export async function initDb(): Promise<void> {
  await db.transaction('rw', db.categories, db.accounts, async () => {
    if ((await db.categories.count()) === 0) {
      await db.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: newId(), archived: false, order: i })),
      )
    }
    // Fresh installs skip the v2 upgrade, so make sure at least one account exists.
    if ((await db.accounts.count()) === 0) await db.accounts.add(newDefaultAccount())
  })
  // Ask the browser not to evict our data; failure is non-fatal.
  try {
    await navigator.storage?.persist?.()
  } catch (err) {
    console.warn('storage.persist() failed', err)
  }
}
