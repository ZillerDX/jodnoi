import { useState } from 'react'
import { useAccount } from './AccountContext'
import Modal from './Modal'

export default function AccountSwitcher({ onManage }: { onManage: () => void }) {
  const { accounts, active, setActiveId } = useAccount()
  const [open, setOpen] = useState(false)
  const visible = accounts.filter((a) => !a.archived)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`บัญชี ${active.name} (เปลี่ยนบัญชี)`}
        className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-3 pl-1.5 text-sm font-medium"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-base" style={{ background: `${active.color}26` }}>
          {active.icon}
        </span>
        <span className="max-w-[10rem] truncate">{active.name}</span>
        <span className="text-xs text-muted">▾</span>
      </button>

      {open && (
        <Modal title="เลือกบัญชี" onClose={() => setOpen(false)}>
          <div className="space-y-2">
            {visible.map((a) => {
              const on = a.id === active.id
              return (
                <button
                  key={a.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setActiveId(a.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${on ? 'border-ink' : 'border-line'}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ background: `${a.color}26` }}>{a.icon}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
                  {on && <span className="text-sm text-income">✓ ใช้อยู่</span>}
                </button>
              )
            })}
            <button
              onClick={() => {
                setOpen(false)
                onManage()
              }}
              className="w-full rounded-2xl border border-dashed border-line py-3 text-sm font-medium"
            >
              + เพิ่ม / จัดการบัญชี
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
