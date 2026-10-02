import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useAccount } from '../components/AccountContext'
import RangePicker from '../components/RangePicker'
import { db } from '../db/db'
import { formatDateTh } from '../lib/dates'
import { formatBaht } from '../lib/money'
import { resolveRange, type RangeState } from '../lib/range'
import { summarize, type CategoryTotal } from '../lib/summary'
import type { TxType } from '../lib/types'

interface Props {
  range: RangeState
  onRange: (r: RangeState) => void
}

function Breakdown({ items, total }: { items: CategoryTotal[]; total: number }) {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted">ไม่มีข้อมูลในช่วงนี้</p>
  return (
    <>
      <div className="relative mx-auto h-48 w-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={items.map((c) => ({ ...c, fill: c.color }))} dataKey="totalSatang" nameKey="name" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none">
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted">รวม</span>
          <span className="tabular text-lg font-semibold">{formatBaht(total)}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((c) => {
          const pct = total ? (c.totalSatang / total) * 100 : 0
          return (
            <li key={c.categoryId}>
              <div className="flex items-center justify-between text-sm">
                <span>{c.icon} {c.name}</span>
                <span className="tabular"><b className="font-semibold">{formatBaht(c.totalSatang)}</b> <span className="text-muted">{pct.toFixed(0)}%</span></span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default function Dashboard({ range, onRange }: Props) {
  const r = resolveRange(range)
  const accountId = useAccount().active.id
  const [tab, setTab] = useState<TxType>('expense')
  const categories = useLiveQuery(() => db.categories.toArray(), [])
  const txs = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(r.from, r.to, true, true)
        .and((t) => t.accountId === accountId)
        .toArray(),
    [r.from, r.to, accountId],
  )
  const s = summarize(txs ?? [], categories ?? [], r)
  const items = tab === 'expense' ? s.expenseByCategory : s.incomeByCategory
  const total = tab === 'expense' ? s.expense : s.income
  const manyDays = s.byDay.length > 62
  const tick = (d: string) => (manyDays ? d.slice(5, 7) : String(Number(d.slice(8))))

  return (
    <div className="space-y-5 px-4 pt-6">
      <h1 className="text-xl font-semibold">สรุป</h1>
      <RangePicker value={range} onChange={onRange} />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'เงินเข้า', v: s.income, cls: 'text-income' },
          { label: 'เงินออก', v: s.expense, cls: 'text-expense' },
          { label: 'คงเหลือ', v: s.balance, cls: s.balance < 0 ? 'text-expense' : '' },
        ].map((x) => (
          <div key={x.label} className="rounded-2xl border border-line bg-surface p-3">
            <p className="text-xs text-muted">{x.label}</p>
            <p className={`tabular mt-1 truncate text-[17px] font-semibold ${x.cls}`}>{formatBaht(x.v)}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="mb-2 text-sm font-medium text-muted">รายวัน</h2>
        <div className="h-36">
          <ResponsiveContainer>
            <BarChart data={s.byDay} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tickFormatter={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <Tooltip
                cursor={{ fill: 'var(--color-line)', opacity: 0.4 }}
                labelFormatter={(d) => formatDateTh(String(d), { day: 'numeric', month: 'short' })}
                formatter={(v, name) => [formatBaht(Number(v)), name === 'income' ? 'เข้า' : 'ออก']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="income" fill="var(--color-income)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-4 flex rounded-xl bg-bg p-1 text-sm">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-1.5 font-medium transition ${tab === t ? 'bg-surface shadow-sm' : 'text-muted'}`}
            >
              {t === 'expense' ? 'ออกไปที่ไหน' : 'เข้ามาจากไหน'}
            </button>
          ))}
        </div>
        <Breakdown items={items} total={total} />
      </section>
    </div>
  )
}
