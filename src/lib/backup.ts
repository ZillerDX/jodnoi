import type { Account, Category, Transaction, TxType } from './types'

export interface BackupFile {
  app: 'expense-tracker'
  version: 2
  exportedAt: string
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
}

export interface ParsedBackup {
  /** Empty for v1 files. */
  accounts: Account[]
  categories: Category[]
  /** accountId is '' when the file did not say (v1); the importer fills it in. */
  transactions: Transaction[]
}

const isType = (v: unknown): v is TxType => v === 'expense' || v === 'income'
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function isNamed(v: unknown): v is Account {
  const c = v as Record<string, unknown>
  return (
    !!c && isStr(c.id) && isStr(c.name) && isStr(c.icon) && isStr(c.color) &&
    typeof c.archived === 'boolean' && isNum(c.order)
  )
}

const isCategory = (v: unknown): v is Category => isNamed(v) && isType((v as unknown as Record<string, unknown>).type)

/** accountId is optional here because v1 backups predate accounts. */
function isTransactionLike(v: unknown): v is Omit<Transaction, 'accountId'> & { accountId?: string } {
  const t = v as Record<string, unknown>
  return (
    !!t && isStr(t.id) && isType(t.type) && isNum(t.amountSatang) && t.amountSatang > 0 &&
    Number.isInteger(t.amountSatang) && isStr(t.categoryId) && isStr(t.date) &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date) && isStr(t.note) && isNum(t.createdAt) &&
    (t.accountId === undefined || isStr(t.accountId))
  )
}

/** Parses and validates backup JSON (v1 or v2). Throws a Thai-language Error on invalid input. */
export function parseBackup(json: string): ParsedBackup {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง')
  }
  const b = data as { app?: unknown; version?: unknown; accounts?: unknown; categories?: unknown; transactions?: unknown }
  if (
    b?.app !== 'expense-tracker' || (b.version !== 1 && b.version !== 2) ||
    !Array.isArray(b.categories) || !Array.isArray(b.transactions)
  ) {
    throw new Error('ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอปนี้')
  }
  const accounts: unknown = b.version === 2 ? b.accounts : []
  if (!Array.isArray(accounts) || !accounts.every(isNamed) || !b.categories.every(isCategory) || !b.transactions.every(isTransactionLike)) {
    throw new Error('ข้อมูลในไฟล์ไม่ถูกต้อง (ไม่มีการนำเข้า)')
  }
  const txs = b.transactions as Array<Omit<Transaction, 'accountId'> & { accountId?: string }>
  if (b.version === 2) {
    const ids = new Set(accounts.map((a: Account) => a.id))
    if (!txs.every((t) => t.accountId !== undefined && ids.has(t.accountId))) {
      throw new Error('ข้อมูลในไฟล์ไม่ถูกต้อง (รายการอ้างอิงบัญชีที่ไม่มี)')
    }
  }
  return {
    accounts: accounts as Account[],
    categories: b.categories as Category[],
    transactions: txs.map((t) => ({ ...t, accountId: t.accountId ?? '' })),
  }
}

/** Fills the account for transactions that have none (v1 files). */
export function assignFallbackAccount(txs: Transaction[], fallbackAccountId: string): Transaction[] {
  return txs.map((t) => (t.accountId ? t : { ...t, accountId: fallbackAccountId }))
}

export function transactionsToCsv(txs: Transaction[], categories: Category[], accounts: Account[]): string {
  const cats = new Map(categories.map((c) => [c.id, c.name]))
  const accs = new Map(accounts.map((a) => [a.id, a.name]))
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
  const rows = [...txs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) =>
      [
        t.date,
        esc(accs.get(t.accountId) ?? ''),
        t.type === 'income' ? 'เงินเข้า' : 'เงินออก',
        esc(cats.get(t.categoryId) ?? 'ไม่ระบุหมวด'),
        (t.amountSatang / 100).toFixed(2),
        esc(t.note),
      ].join(','),
    )
  return '﻿' + ['วันที่,บัญชี,ประเภท,หมวดหมู่,จำนวน(บาท),โน้ต', ...rows].join('\n')
}
