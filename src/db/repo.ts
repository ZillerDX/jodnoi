import { newId } from '../lib/id'
import { toDateString } from '../lib/dates'
import { assignFallbackAccount, type BackupFile, type ParsedBackup } from '../lib/backup'
import type { Account, Category, Transaction } from '../lib/types'
import { db } from './db'

export async function saveTransaction(input: Omit<Transaction, 'id' | 'createdAt'> & Partial<Pick<Transaction, 'id' | 'createdAt'>>) {
  const tx: Transaction = {
    ...input,
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? Date.now(),
  }
  await db.transactions.put(tx)
  return tx
}

export const deleteTransaction = (id: string) => db.transactions.delete(id)
export const restoreTransaction = (tx: Transaction) => db.transactions.put(tx)

export async function saveCategory(input: Pick<Category, 'type' | 'name' | 'icon' | 'color'> & { id?: string }) {
  if (input.id) {
    await db.categories.update(input.id, { name: input.name, icon: input.icon, color: input.color })
    return
  }
  const last = await db.categories.where('type').equals(input.type).count()
  await db.categories.add({ ...input, id: newId(), archived: false, order: Date.now() + last })
}

export const countTransactionsInCategory = (id: string) =>
  db.transactions.where('categoryId').equals(id).count()

/** Deletes only the category; its transactions are kept and show as "ไม่ระบุหมวด". */
export const deleteCategory = (id: string) => db.categories.delete(id)

export const setCategoryArchived = (id: string, archived: boolean) => db.categories.update(id, { archived })

// ---------- accounts ----------

export async function saveAccount(input: Pick<Account, 'name' | 'icon' | 'color'> & { id?: string }): Promise<string> {
  if (input.id) {
    await db.accounts.update(input.id, { name: input.name, icon: input.icon, color: input.color })
    return input.id
  }
  const id = newId()
  await db.accounts.add({ ...input, id, archived: false, order: Date.now() })
  return id
}

export const countTransactionsInAccount = (id: string) =>
  db.transactions.where('accountId').equals(id).count()

/** Archiving or deleting must always leave at least one visible account. */
async function otherVisibleAccounts(id: string): Promise<number> {
  return db.accounts.filter((a) => a.id !== id && !a.archived).count()
}

export async function setAccountArchived(id: string, archived: boolean): Promise<void> {
  if (archived && (await otherVisibleAccounts(id)) === 0) {
    throw new Error('ต้องเหลืออย่างน้อย 1 บัญชีที่แสดงอยู่')
  }
  await db.accounts.update(id, { archived })
}

/**
 * Deletes an account. If it has transactions they are moved to `moveToId`
 * (required in that case) so no data is lost.
 */
export async function deleteAccount(id: string, moveToId?: string): Promise<void> {
  if ((await otherVisibleAccounts(id)) === 0) throw new Error('ต้องเหลืออย่างน้อย 1 บัญชีที่แสดงอยู่')
  await db.transaction('rw', db.accounts, db.transactions, async () => {
    const count = await db.transactions.where('accountId').equals(id).count()
    if (count > 0) {
      if (!moveToId || moveToId === id || !(await db.accounts.get(moveToId))) {
        throw new Error('เลือกบัญชีปลายทางที่จะย้ายรายการไป')
      }
      await db.transactions.where('accountId').equals(id).modify({ accountId: moveToId })
    }
    await db.accounts.delete(id)
  })
}

// ---------- export / import ----------

export async function exportBackup(): Promise<BackupFile> {
  const [accounts, categories, transactions] = await Promise.all([
    db.accounts.toArray(),
    db.categories.toArray(),
    db.transactions.toArray(),
  ])
  return { app: 'expense-tracker', version: 2, exportedAt: new Date().toISOString(), accounts, categories, transactions }
}

/**
 * Merges a backup into the DB by id (existing ids are overwritten).
 * Transactions without an account (v1 files) go to `fallbackAccountId`.
 * Returns number of transactions imported.
 */
export async function importBackup(file: ParsedBackup, fallbackAccountId: string): Promise<number> {
  const transactions = assignFallbackAccount(file.transactions, fallbackAccountId)
  await db.transaction('rw', db.accounts, db.categories, db.transactions, async () => {
    await db.accounts.bulkPut(file.accounts)
    await db.categories.bulkPut(file.categories)
    await db.transactions.bulkPut(transactions)
  })
  return transactions.length
}

export function downloadText(filename: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const todayString = () => toDateString(new Date())
