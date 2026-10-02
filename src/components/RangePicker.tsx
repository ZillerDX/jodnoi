import { formatDateTh } from '../lib/dates'
import { customFromRange, resolveRange, stepMonth, type RangeState } from '../lib/range'

interface Props {
  value: RangeState
  onChange: (r: RangeState) => void
}

const chip = (on: boolean) =>
  `shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${on ? 'bg-accent text-accent-ink' : 'bg-surface text-muted border border-line'}`

export default function RangePicker({ value, onChange }: Props) {
  const range = resolveRange(value)
  const now = new Date()
  const label =
    value.kind === 'month'
      ? value.ref.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
      : `${formatDateTh(range.from, { day: 'numeric', month: 'short', year: '2-digit' })} – ${formatDateTh(range.to, { day: 'numeric', month: 'short', year: '2-digit' })}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {value.kind === 'month' ? (
          <button onClick={() => onChange({ kind: 'month', ref: stepMonth(value.ref, -1) })} aria-label="เดือนก่อน" className="rounded-full p-2 text-lg">‹</button>
        ) : (
          <span className="w-9" />
        )}
        <span className="text-base font-semibold">{label}</span>
        {value.kind === 'month' ? (
          <button onClick={() => onChange({ kind: 'month', ref: stepMonth(value.ref, 1) })} aria-label="เดือนถัดไป" className="rounded-full p-2 text-lg">›</button>
        ) : (
          <span className="w-9" />
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button className={chip(value.kind === 'month')} onClick={() => onChange({ kind: 'month', ref: now })}>เดือนนี้</button>
        <button className={chip(value.kind === 'days' && value.days === 7)} onClick={() => onChange({ kind: 'days', days: 7 })}>7 วัน</button>
        <button className={chip(value.kind === 'days' && value.days === 30)} onClick={() => onChange({ kind: 'days', days: 30 })}>30 วัน</button>
        <button className={chip(value.kind === 'year')} onClick={() => onChange({ kind: 'year' })}>ปีนี้</button>
        <button className={chip(value.kind === 'custom')} onClick={() => onChange(customFromRange(range))}>กำหนดเอง</button>
      </div>

      {value.kind === 'custom' && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={value.from}
            max={value.to}
            onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2"
            aria-label="ตั้งแต่วันที่"
          />
          <span className="text-muted">ถึง</span>
          <input
            type="date"
            value={value.to}
            min={value.from}
            onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2"
            aria-label="ถึงวันที่"
          />
        </div>
      )}
    </div>
  )
}
