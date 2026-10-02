import { describe, expect, it } from 'vitest'
import { eachDay, lastDaysRange, monthRange, shiftMonth } from './dates'
import { formatBaht, parseAmountToSatang } from './money'
import { summarize } from './summary'
import type { Category, Transaction } from './types'

const cats: Category[] = [
  { id: 'food', type: 'expense', name: 'อาหาร', icon: '🍜', color: '#f00', archived: false, order: 0 },
  { id: 'salary', type: 'income', name: 'เงินเดือน', icon: '💼', color: '#0f0', archived: false, order: 0 },
]
const tx = (
  id: string,
  type: Transaction['type'],
  baht: number,
  categoryId: string,
  date: string,
): Transaction => ({ id, accountId: 'a1', type, amountSatang: baht * 100, categoryId, date, note: '', createdAt: 0 })

describe('money', () => {
  it('parses valid amounts to satang', () => {
    expect(parseAmountToSatang('1,250.50')).toBe(125050)
    expect(parseAmountToSatang('0.1')).toBe(10)
    expect(parseAmountToSatang('100')).toBe(10000)
  })
  it('rejects invalid or non-positive amounts', () => {
    for (const s of ['', '0', 'abc', '-5', '1.234', '1.2.3']) expect(parseAmountToSatang(s)).toBeNull()
  })
  it('formats baht', () => {
    expect(formatBaht(125000)).toBe('฿1,250')
    expect(formatBaht(125050)).toBe('฿1,250.50')
    expect(formatBaht(-5000, { sign: true })).toBe('-฿50')
    expect(formatBaht(5000, { sign: true })).toBe('+฿50')
  })
})

describe('dates', () => {
  it('computes month range incl. leap February and month shift', () => {
    expect(monthRange(new Date(2024, 1, 15))).toEqual({ from: '2024-02-01', to: '2024-02-29' })
    expect(monthRange(shiftMonth(new Date(2025, 0, 31), -1))).toEqual({
      from: '2024-12-01',
      to: '2024-12-31',
    })
  })
  it('computes last N days across month boundary', () => {
    expect(lastDaysRange(new Date(2025, 2, 2), 7)).toEqual({ from: '2025-02-24', to: '2025-03-02' })
  })
  it('lists each day inclusive', () => {
    expect(eachDay({ from: '2025-01-30', to: '2025-02-02' })).toEqual([
      '2025-01-30',
      '2025-01-31',
      '2025-02-01',
      '2025-02-02',
    ])
  })
})

describe('summarize', () => {
  const txs = [
    tx('1', 'expense', 100, 'food', '2025-03-01'),
    tx('2', 'expense', 50, 'food', '2025-03-02'),
    tx('3', 'income', 1000, 'salary', '2025-03-02'),
    tx('4', 'expense', 999, 'food', '2025-04-01'),
    tx('5', 'expense', 10, 'deleted-cat', '2025-03-03'),
  ]
  const s = summarize(txs, cats, { from: '2025-03-01', to: '2025-03-31' })
  it('totals only transactions in range', () => {
    expect(s.expense).toBe(16000)
    expect(s.income).toBe(100000)
    expect(s.balance).toBe(84000)
  })
  it('groups by category sorted desc, with fallback for unknown category', () => {
    expect(s.expenseByCategory.map((c) => c.name)).toEqual(['อาหาร', 'ไม่ระบุหมวด'])
    expect(s.expenseByCategory[0].totalSatang).toBe(15000)
  })
  it('fills every day in range', () => {
    expect(s.byDay).toHaveLength(31)
    expect(s.byDay[1]).toEqual({ date: '2025-03-02', income: 100000, expense: 5000 })
  })
})
