import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { useAccount } from '../components/AccountContext'
import Modal from '../components/Modal'
import { db } from '../db/db'
import {
  countTransactionsInAccount,
  countTransactionsInCategory,
  deleteAccount,
  deleteCategory,
  downloadText,
  exportBackup,
  importBackup,
  saveAccount,
  saveCategory,
  setAccountArchived,
  setCategoryArchived,
  todayString,
} from '../db/repo'
import { parseBackup, transactionsToCsv } from '../lib/backup'
import type { Account, Category, TxType } from '../lib/types'

const COLORS = ['#f97316', '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#14b8a6', '#22c55e', '#eab308', '#64748b']
const ICONS = ['🍜', '☕', '🛒', '🚌', '⛽', '🏠', '🧾', '💊', '🎬', '🎮', '👕', '📚', '✈️', '🐶', '💼', '💻', '🎁', '💰', '📦', '🏦']

interface Draft {
  id?: string
  name: string
  icon: string
  color: string
}

interface EditorProps {
  draft: Draft
  placeholder: string
  saveLabel: string
  onSave: (d: Draft) => Promise<void>
  onDone: () => void
}

/** Name + icon + color form shared by categories and accounts. */
function ItemEditor({ draft, placeholder, saveLabel, onSave, onDone }: EditorProps) {
  const [d, setD] = useState(draft)
  const [error, setError] = useState('')

  async function save() {
    const name = d.name.trim()
    if (!name) return setError('ใส่ชื่อก่อน')
    try {
      await onSave({ ...d, name })
      onDone()
    } catch (err) {
      console.error(err)
      setError('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: `${d.color}26` }}>
          {d.icon}
        </span>
        <input
          value={d.name}
          maxLength={20}
          onChange={(e) => {
            setD({ ...d, name: e.target.value })
            setError('')
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2.5"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ICONS.map((i) => (
          <button key={i} onClick={() => setD({ ...d, icon: i })} aria-label={`ไอคอน ${i}`} className={`h-9 w-9 rounded-lg text-xl ${d.icon === i ? 'bg-line' : ''}`}>
            {i}
          </button>
        ))}
        <input
          value={ICONS.includes(d.icon) ? '' : d.icon}
          onChange={(e) => e.target.value && setD({ ...d, icon: [...e.target.value].slice(-1)[0] })}
          placeholder="อื่น"
          className="h-9 w-14 rounded-lg border border-line bg-bg text-center text-sm"
          aria-label="อีโมจิอื่น"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setD({ ...d, color: c })}
            aria-label={`สี ${c}`}
            aria-pressed={d.color === c}
            className={`h-7 w-7 rounded-full ${d.color === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
            style={{ background: c }}
          />
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-expense">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onDone} className="rounded-xl border border-line px-4 py-2.5 text-sm">ยกเลิก</button>
        <button onClick={save} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-ink">{saveLabel}</button>
      </div>
    </div>
  )
}

function Accounts() {
  const { accounts, active, setActiveId } = useAccount()
  const [editing, setEditing] = useState<Draft | null>(null)
  const [deleting, setDeleting] = useState<{ acc: Account; count: number; moveTo: string } | null>(null)
  const [error, setError] = useState('')
  const visibleCount = accounts.filter((a) => !a.archived).length

  async function askDelete(acc: Account) {
    setError('')
    const count = await countTransactionsInAccount(acc.id)
    const target = accounts.find((a) => a.id !== acc.id && !a.archived)
    setDeleting({ acc, count, moveTo: target?.id ?? '' })
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteAccount(deleting.acc.id, deleting.moveTo || undefined)
      setDeleting(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  async function toggleArchive(a: Account) {
    setError('')
    try {
      await setAccountArchived(a.id, !a.archived)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ทำรายการไม่สำเร็จ')
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted">บัญชี</h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {accounts.map((a) => {
          const isLastVisible = !a.archived && visibleCount <= 1
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${a.archived ? 'opacity-40' : ''}`} style={{ background: `${a.color}26` }}>{a.icon}</span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${a.archived ? 'text-muted line-through' : ''}`}>{a.name}</span>
                {a.id === active.id && <span className="text-xs text-income">ใช้อยู่</span>}
              </span>
              <button onClick={() => setEditing({ id: a.id, name: a.name, icon: a.icon, color: a.color })} className="px-2 py-1 text-sm text-muted">แก้ไข</button>
              <button onClick={() => toggleArchive(a)} disabled={isLastVisible} className="px-2 py-1 text-sm text-muted disabled:opacity-30">{a.archived ? 'แสดง' : 'ซ่อน'}</button>
              <button onClick={() => askDelete(a)} disabled={isLastVisible} aria-label={`ลบบัญชี ${a.name}`} className="px-2 py-1 text-sm text-expense disabled:opacity-30">ลบ</button>
            </div>
          )
        })}
      </div>
      {error && <p role="alert" className="text-sm text-expense">{error}</p>}
      <button onClick={() => setEditing({ name: '', icon: '💳', color: COLORS[7] })} className="w-full rounded-2xl border border-dashed border-line py-3 text-sm font-medium">
        + เพิ่มบัญชี
      </button>
      <p className="text-xs text-muted">แต่ละบัญชีแยกรายการกัน หมวดหมู่ใช้ร่วมกันทุกบัญชี</p>

      {editing && (
        <Modal title={editing.id ? 'แก้ไขบัญชี' : 'เพิ่มบัญชี'} onClose={() => setEditing(null)}>
          <ItemEditor
            key={editing.id ?? 'new'}
            draft={editing}
            placeholder="ชื่อบัญชี เช่น เงินสด, บัตรเครดิต"
            saveLabel="บันทึกบัญชี"
            onSave={async (d) => {
              const id = await saveAccount(d)
              if (!d.id) setActiveId(id)
            }}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title="ลบบัญชี" alert onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm">ลบบัญชี “{deleting.acc.icon} {deleting.acc.name}” ใช่ไหม</p>
            {deleting.count > 0 ? (
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">มี {deleting.count} รายการในบัญชีนี้ เลือกบัญชีที่จะย้ายรายการไป</span>
                <select
                  value={deleting.moveTo}
                  onChange={(e) => setDeleting({ ...deleting, moveTo: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2.5"
                >
                  {accounts
                    .filter((a) => a.id !== deleting.acc.id && !a.archived)
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                    ))}
                </select>
              </label>
            ) : (
              <p className="text-sm text-muted">ยังไม่มีรายการในบัญชีนี้</p>
            )}
            {error && <p role="alert" className="text-sm text-expense">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setDeleting(null)} className="rounded-xl border border-line px-4 py-2.5 text-sm">ยกเลิก</button>
              <button onClick={confirmDelete} className="flex-1 rounded-xl bg-expense py-2.5 text-sm font-semibold text-white">
                {deleting.count > 0 ? 'ย้ายรายการแล้วลบบัญชี' : 'ลบบัญชี'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}

function Categories() {
  const [type, setType] = useState<TxType>('expense')
  const [editing, setEditing] = useState<Draft | null>(null)
  const cats = useLiveQuery(() => db.categories.where('type').equals(type).sortBy('order'), [type])
  const [deleting, setDeleting] = useState<{ cat: Category; count: number } | null>(null)

  async function askDelete(cat: Category) {
    setEditing(null)
    setDeleting({ cat, count: await countTransactionsInCategory(cat.id) })
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted">หมวดหมู่</h2>
      <div className="flex rounded-xl bg-line/50 p-1 text-sm">
        {(['expense', 'income'] as const).map((t) => (
          <button key={t} onClick={() => { setType(t); setEditing(null); setDeleting(null) }} className={`flex-1 rounded-lg py-1.5 font-medium ${type === t ? 'bg-surface shadow-sm' : 'text-muted'}`}>
            {t === 'expense' ? 'เงินออก' : 'เงินเข้า'}
          </button>
        ))}
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {cats?.map((c: Category) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${c.archived ? 'opacity-40' : ''}`} style={{ background: `${c.color}26` }}>{c.icon}</span>
            <span className={`flex-1 truncate ${c.archived ? 'text-muted line-through' : ''}`}>{c.name}</span>
            <button onClick={() => setEditing({ id: c.id, name: c.name, icon: c.icon, color: c.color })} className="px-2 py-1 text-sm text-muted">แก้ไข</button>
            <button onClick={() => setCategoryArchived(c.id, !c.archived)} className="px-2 py-1 text-sm text-muted">{c.archived ? 'แสดง' : 'ซ่อน'}</button>
            <button onClick={() => askDelete(c)} aria-label={`ลบหมวด ${c.name}`} className="px-2 py-1 text-sm text-expense">ลบ</button>
          </div>
        ))}
      </div>

      {deleting && (
        <Modal title="ลบหมวดหมู่" alert onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm">
              ลบหมวด “{deleting.cat.icon} {deleting.cat.name}” ใช่ไหม
              {deleting.count > 0 ? (
                <span className="mt-1.5 block text-muted">
                  มี {deleting.count} รายการในหมวดนี้ รายการจะไม่ถูกลบ แต่จะแสดงเป็น “ไม่ระบุหมวด” (ถ้าแค่ไม่อยากเห็นในตัวเลือก ใช้ “ซ่อน” แทนได้)
                </span>
              ) : (
                <span className="mt-1.5 block text-muted">ยังไม่มีรายการในหมวดนี้</span>
              )}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleting(null)} className="rounded-xl border border-line px-4 py-2.5 text-sm">ยกเลิก</button>
              <button
                onClick={async () => {
                  await deleteCategory(deleting.cat.id)
                  setDeleting(null)
                }}
                className="flex-1 rounded-xl bg-expense py-2.5 text-sm font-semibold text-white"
              >
                ลบหมวดหมู่
              </button>
            </div>
          </div>
        </Modal>
      )}

      <button onClick={() => setEditing({ name: '', icon: '📦', color: COLORS[4] })} className="w-full rounded-2xl border border-dashed border-line py-3 text-sm font-medium">
        + เพิ่มหมวดหมู่
      </button>
      {editing && (
        <Modal title={editing.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'} onClose={() => setEditing(null)}>
          <ItemEditor
            key={editing.id ?? 'new'}
            draft={editing}
            placeholder="ชื่อหมวดหมู่"
            saveLabel="บันทึกหมวดหมู่"
            onSave={(d) => saveCategory({ ...d, type })}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}
      <p className="text-xs text-muted">การซ่อนหมวดหมู่จะไม่ลบรายการเดิม</p>
    </section>
  )
}

function Data() {
  const { active } = useAccount()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function onFile(file: File) {
    try {
      const n = await importBackup(parseBackup(await file.text()), active.id)
      setMsg({ ok: true, text: `นำเข้าสำเร็จ ${n} รายการ` })
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'นำเข้าไม่สำเร็จ' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted">ข้อมูลและสำรอง</h2>
      <p className="text-xs text-muted">ข้อมูลเก็บในเครื่องนี้เท่านั้น หากล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง ข้อมูลจะหาย ควรสำรองเป็นระยะ</p>
      <div className="grid grid-cols-2 gap-2 text-sm font-medium">
        <button
          className="rounded-xl border border-line bg-surface py-3"
          onClick={async () => downloadText(`expense-backup-${todayString()}.json`, JSON.stringify(await exportBackup(), null, 2), 'application/json')}
        >
          สำรองข้อมูล (JSON)
        </button>
        <button className="rounded-xl border border-line bg-surface py-3" onClick={() => fileRef.current?.click()}>
          นำเข้าไฟล์สำรอง
        </button>
        <button
          className="col-span-2 rounded-xl border border-line bg-surface py-3"
          onClick={async () => {
            const [t, c, a] = await Promise.all([db.transactions.toArray(), db.categories.toArray(), db.accounts.toArray()])
            downloadText(`expense-${todayString()}.csv`, transactionsToCsv(t, c, a), 'text/csv;charset=utf-8')
          }}
        >
          ส่งออก CSV ทุกบัญชี (Excel/Sheets)
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-income' : 'text-expense'}`}>{msg.text}</p>}
    </section>
  )
}

export default function Settings() {
  return (
    <div className="space-y-7 px-4 pt-6">
      <h1 className="text-xl font-semibold">ตั้งค่า</h1>
      <Accounts />
      <Categories />
      <Data />
    </div>
  )
}
