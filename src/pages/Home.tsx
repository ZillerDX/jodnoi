import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { useAccount } from '../components/AccountContext'
import TxRow from '../components/TxRow'
import { db } from '../db/db'
import { monthRange } from '../lib/dates'
import { formatBaht } from '../lib/money'
import { summarize } from '../lib/summary'
import type { Transaction, TxType } from '../lib/types'

export default function Home({ onAdd, onEdit }: { onAdd: (t: TxType) => void; onEdit: (tx: Transaction) => void }) {
  const { active } = useAccount()
  const accountId = active.id
  const range = useMemo(() => monthRange(new Date()), [])
  const categories = useLiveQuery(() => db.categories.toArray(), [])
  const monthTxs = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(range.from, range.to, true, true)
        .and((t) => t.accountId === accountId)
        .toArray(),
    [range, accountId],
  )
  const recent = useLiveQuery(async () => {
    const all = await db.transactions
      .orderBy('date')
      .reverse()
      .filter((t) => t.accountId === accountId)
      .limit(30)
      .toArray()
    return all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 6)
  }, [accountId])

  const s = summarize(monthTxs ?? [], categories ?? [], range)
  const catMap = new Map((categories ?? []).map((c) => [c.id, c]))
  const monthLabel = new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 px-4 pt-6">
      <header className="relative">
        <img src="/avatar.svg" alt="" aria-hidden="true" width={64} height={64} className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-full shadow-md ring-4 ring-surface" />
        <p className="text-sm text-muted">คงเหลือ {monthLabel}</p>
        <p className={`tabular mt-1 pr-20 text-5xl leading-tight font-semibold tracking-tight ${s.balance < 0 ? 'text-expense' : ''}`}>
          {formatBaht(s.balance)}
        </p>
        <div className="mt-3 flex gap-5 text-sm">
          <span className="text-muted">เข้า <b className="tabular font-semibold text-income">{formatBaht(s.income)}</b></span>
          <span className="text-muted">ออก <b className="tabular font-semibold text-expense">{formatBaht(s.expense)}</b></span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAdd('expense')}
          className="rounded-3xl bg-expense/10 py-7 text-lg font-semibold text-expense active:scale-[0.98]"
        >
          <span className="block text-3xl leading-none">−</span>
          เงินออก
        </button>
        <button
          onClick={() => onAdd('income')}
          className="rounded-3xl bg-income/10 py-7 text-lg font-semibold text-income active:scale-[0.98]"
        >
          <span className="block text-3xl leading-none">+</span>
          เงินเข้า
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted">ล่าสุด</h2>
        {recent && recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-6 text-center text-sm text-muted">
            <img src="/mascot.svg" alt="" aria-hidden="true" className="h-24 w-24 object-contain" />
            ยังไม่มีรายการ กดปุ่มด้านบนเพื่อเริ่มบันทึก
          </div>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {recent?.map((t) => (
              <TxRow key={t.id} tx={t} category={catMap.get(t.categoryId)} onClick={() => onEdit(t)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
