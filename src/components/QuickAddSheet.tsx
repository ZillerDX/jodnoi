import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { db } from '../db/db'
import { useAccount } from './AccountContext'
import { deleteTransaction, saveTransaction } from '../db/repo'
import { toDateString } from '../lib/dates'
import { parseAmountToSatang } from '../lib/money'
import type { Transaction, TxType } from '../lib/types'

interface Props {
  type: TxType
  /** When set, the sheet edits this transaction instead of creating one. */
  editing?: Transaction
  onClose: () => void
  onDeleted?: (tx: Transaction) => void
}

export default function QuickAddSheet({ type, editing, onClose, onDeleted }: Props) {
  const { accounts, active } = useAccount()
  const account = (editing && accounts.find((a) => a.id === editing.accountId)) || active
  const categories = useLiveQuery(
    () => db.categories.where('type').equals(type).sortBy('order'),
    [type],
  )
  const visible = useMemo(
    () => (categories ?? []).filter((c) => !c.archived || c.id === editing?.categoryId),
    [categories, editing],
  )

  const [amount, setAmount] = useState(editing ? String(editing.amountSatang / 100) : '')
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '')
  const [date, setDate] = useState(editing?.date ?? toDateString(new Date()))
  const [note, setNote] = useState(editing?.note ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isIncome = type === 'income'
  const tone = isIncome ? 'text-income' : 'text-expense'

  async function save() {
    const satang = parseAmountToSatang(amount)
    if (satang === null) return setError('ใส่จำนวนเงินให้ถูกต้อง (มากกว่า 0)')
    if (!categoryId) return setError('เลือกหมวดหมู่ก่อน')
    if (!date) return setError('เลือกวันที่')
    setSaving(true)
    try {
      await saveTransaction({
        id: editing?.id,
        accountId: account.id,
        createdAt: editing?.createdAt,
        type,
        amountSatang: satang,
        categoryId,
        date,
        note: note.trim(),
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง')
      setSaving(false)
    }
  }

  async function remove() {
    if (!editing) return
    await deleteTransaction(editing.id)
    onDeleted?.(editing)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-label={isIncome ? 'บันทึกเงินเข้า' : 'บันทึกเงินออก'}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-semibold ${tone}`}>
              {editing ? 'แก้ไข' : ''}
              {isIncome ? 'เงินเข้า' : 'เงินออก'}
            </h2>
            <p className="text-xs text-muted">{account.icon} {account.name}</p>
          </div>
          <button onClick={onClose} aria-label="ปิด" className="rounded-full p-2 text-muted">✕</button>
        </div>

        <div className="mt-2 flex items-baseline gap-2 border-b border-line pb-3">
          <span className={`text-3xl font-semibold ${tone}`}>฿</span>
          <input
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="tabular w-full bg-transparent text-5xl font-semibold outline-none placeholder:text-line"
            aria-label="จำนวนเงิน"
          />
        </div>

        <p className="mt-4 mb-2 text-sm text-muted">{isIncome ? 'เข้ามาจากไหน' : 'จ่ายค่าอะไร'}</p>
        <div className="grid grid-cols-4 gap-2">
          {visible.map((c) => {
            const on = c.id === categoryId
            return (
              <button
                key={c.id}
                onClick={() => {
                  setCategoryId(c.id)
                  setError('')
                }}
                aria-pressed={on}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 text-xs transition ${on ? 'border-transparent text-white' : 'border-line bg-bg text-ink'}`}
                style={on ? { background: c.color } : undefined}
              >
                <span className="text-2xl leading-none">{c.icon}</span>
                <span className="w-full truncate text-center">{c.name}</span>
              </button>
            )
          })}
          {categories && visible.length === 0 && (
            <p className="col-span-4 text-sm text-muted">ยังไม่มีหมวดหมู่ เพิ่มได้ที่หน้า “ตั้งค่า”</p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-line bg-bg px-3 py-2.5 text-sm"
            aria-label="วันที่"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="โน้ต (ไม่บังคับ)"
            maxLength={120}
            className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-expense">{error}</p>}

        <div className="mt-4 flex gap-2">
          {editing && (
            <button onClick={remove} className="rounded-2xl border border-line px-5 py-3.5 font-medium text-expense">
              ลบ
            </button>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-2xl bg-accent py-3.5 text-base font-semibold text-accent-ink disabled:opacity-60"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  )
}
