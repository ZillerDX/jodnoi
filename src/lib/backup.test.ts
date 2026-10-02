import { describe, expect, it } from 'vitest'
import { assignFallbackAccount, parseBackup, transactionsToCsv } from './backup'

const cat = { id: 'c1', type: 'expense', name: 'อาหาร', icon: '🍜', color: '#f00', archived: false, order: 0 }
const acc = { id: 'a1', name: 'เงินสด', icon: '💵', color: '#0f0', archived: false, order: 0 }
const tx = { id: 't1', type: 'expense', amountSatang: 5000, categoryId: 'c1', date: '2025-03-01', note: 'x', createdAt: 1 }

const file = (over: Record<string, unknown>) => JSON.stringify({ app: 'expense-tracker', version: 2, accounts: [acc], categories: [cat], transactions: [{ ...tx, accountId: 'a1' }], ...over })

describe('parseBackup', () => {
  it('accepts a v2 file', () => {
    const p = parseBackup(file({}))
    expect(p.accounts).toHaveLength(1)
    expect(p.transactions[0].accountId).toBe('a1')
  })
  it('accepts a v1 file (no accounts) and leaves accountId empty for the importer', () => {
    const p = parseBackup(JSON.stringify({ app: 'expense-tracker', version: 1, categories: [cat], transactions: [tx] }))
    expect(p.accounts).toEqual([])
    expect(p.transactions[0].accountId).toBe('')
    expect(assignFallbackAccount(p.transactions, 'active')[0].accountId).toBe('active')
  })
  it('keeps existing accountId when assigning fallback', () => {
    const p = parseBackup(file({}))
    expect(assignFallbackAccount(p.transactions, 'other')[0].accountId).toBe('a1')
  })
  it('rejects bad files with a clear error', () => {
    expect(() => parseBackup('nope')).toThrow('JSON')
    expect(() => parseBackup(file({ app: 'other' }))).toThrow('ไม่ใช่ไฟล์สำรอง')
    expect(() => parseBackup(file({ version: 3 }))).toThrow('ไม่ใช่ไฟล์สำรอง')
    expect(() => parseBackup(file({ transactions: [{ ...tx, accountId: 'a1', amountSatang: -1 }] }))).toThrow('ไม่ถูกต้อง')
  })
  it('rejects a v2 transaction that points to a missing account', () => {
    expect(() => parseBackup(file({ transactions: [{ ...tx, accountId: 'ghost' }] }))).toThrow('บัญชี')
    expect(() => parseBackup(file({ transactions: [tx] }))).toThrow('บัญชี')
  })
})

describe('transactionsToCsv', () => {
  it('includes the account column and escapes quotes', () => {
    const csv = transactionsToCsv(
      [{ ...tx, accountId: 'a1', note: 'say "hi"' } as never],
      [cat as never],
      [acc as never],
    )
    expect(csv).toContain('วันที่,บัญชี,ประเภท')
    expect(csv).toContain('2025-03-01,"เงินสด",เงินออก,"อาหาร",50.00,"say ""hi"""')
  })
})
