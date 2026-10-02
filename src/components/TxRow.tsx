import { formatBaht } from '../lib/money'
import type { Category, Transaction } from '../lib/types'

export default function TxRow({
  tx,
  category,
  onClick,
}: {
  tx: Transaction
  category?: Category
  onClick?: () => void
}) {
  const isIncome = tx.type === 'income'
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ background: `${category?.color ?? '#9ca3af'}26` }}
      >
        {category?.icon ?? '❓'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{category?.name ?? 'ไม่ระบุหมวด'}</span>
        {tx.note && <span className="block truncate text-xs text-muted">{tx.note}</span>}
      </span>
      <span className={`tabular text-[15px] font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
        {isIncome ? '+' : '-'}
        {formatBaht(tx.amountSatang)}
      </span>
    </button>
  )
}
