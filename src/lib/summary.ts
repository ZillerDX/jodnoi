import { eachDay } from './dates'
import type { Category, DateRange, Transaction } from './types'

export interface CategoryTotal {
  categoryId: string
  name: string
  color: string
  icon: string
  totalSatang: number
}

export interface DayTotal {
  date: string
  income: number
  expense: number
}

export interface Summary {
  income: number
  expense: number
  balance: number
  expenseByCategory: CategoryTotal[]
  incomeByCategory: CategoryTotal[]
  byDay: DayTotal[]
}

const UNKNOWN: Pick<Category, 'name' | 'color' | 'icon'> = {
  name: 'ไม่ระบุหมวด',
  color: '#9ca3af',
  icon: '❓',
}

function groupByCategory(txs: Transaction[], cats: Map<string, Category>): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const t of txs) totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountSatang)
  return [...totals.entries()]
    .map(([categoryId, totalSatang]) => {
      const c = cats.get(categoryId) ?? UNKNOWN
      return { categoryId, name: c.name, color: c.color, icon: c.icon, totalSatang }
    })
    .sort((a, b) => b.totalSatang - a.totalSatang)
}

export function summarize(txs: Transaction[], categories: Category[], range: DateRange): Summary {
  const cats = new Map(categories.map((c) => [c.id, c]))
  const inRange = txs.filter((t) => t.date >= range.from && t.date <= range.to)
  const expenses = inRange.filter((t) => t.type === 'expense')
  const incomes = inRange.filter((t) => t.type === 'income')
  const sum = (xs: Transaction[]) => xs.reduce((s, t) => s + t.amountSatang, 0)

  const dayMap = new Map<string, DayTotal>(
    eachDay(range).map((date) => [date, { date, income: 0, expense: 0 }]),
  )
  for (const t of inRange) {
    const d = dayMap.get(t.date)
    if (d) d[t.type] += t.amountSatang
  }

  const income = sum(incomes)
  const expense = sum(expenses)
  return {
    income,
    expense,
    balance: income - expense,
    expenseByCategory: groupByCategory(expenses, cats),
    incomeByCategory: groupByCategory(incomes, cats),
    byDay: [...dayMap.values()],
  }
}
