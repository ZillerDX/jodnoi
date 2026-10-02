import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { useAccount } from '../components/AccountContext'
import RangePicker from '../components/RangePicker'
import TxRow from '../components/TxRow'
import { db } from '../db/db'
import { formatDateTh } from '../lib/dates'
import { formatBaht } from '../lib/money'
import { resolveRange, type RangeState } from '../lib/range'
import type { Transaction } from '../lib/types'

interface Props {
  range: RangeState
  onRange: (r: RangeState) => void
  onEdit: (tx: Transaction) => void
}

export default function History({ range, onRange, onEdit }: Props) {
  const r = resolveRange(range)
  const accountId = useAccount().active.id
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
  const catMap = new Map((categories ?? []).map((c) => [c.id, c]))

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of [...(txs ?? [])].sort((a, b) => b.createdAt - a.createdAt)) {
      map.set(t.date, [...(map.get(t.date) ?? []), t])
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [txs])

  return (
    <div className="space-y-4 px-4 pt-6">
      <h1 className="text-xl font-semibold">ประวัติ</h1>
      <RangePicker value={range} onChange={onRange} />
      {groups.length === 0 && txs && (
        <p className="py-12 text-center text-sm text-muted">ไม่มีรายการในช่วงนี้</p>
      )}
      {groups.map(([date, items]) => {
        const net = items.reduce((s, t) => s + (t.type === 'income' ? t.amountSatang : -t.amountSatang), 0)
        return (
          <section key={date}>
            <div className="mb-1.5 flex justify-between px-1 text-sm text-muted">
              <span>{formatDateTh(date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="tabular">{formatBaht(net, { sign: true })}</span>
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {items.map((t) => (
                <TxRow key={t.id} tx={t} category={catMap.get(t.categoryId)} onClick={() => onEdit(t)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
