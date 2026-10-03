import { useState, useSyncExternalStore } from 'react'
import { applyUpdate, dismissUpdate, getUpdateSnapshot, subscribeUpdate } from '../lib/updatePrompt'

/** "มีเวอร์ชันใหม่" card with one-tap update. Renders nothing until an update is ready. */
export default function UpdateBanner() {
  const { needRefresh } = useSyncExternalStore(subscribeUpdate, getUpdateSnapshot)
  const [busy, setBusy] = useState(false)
  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="mx-4 mt-3 flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm"
    >
      <img src="/avatar.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">มี Jodnoi เวอร์ชันใหม่</p>
        <p className="text-xs text-muted">ข้อมูลของคุณไม่หาย อัปเดตแล้วใช้ต่อได้เลย</p>
      </div>
      <button onClick={dismissUpdate} className="px-1 py-1 text-xs text-muted">ไว้ก่อน</button>
      <button
        onClick={() => {
          setBusy(true)
          applyUpdate()?.catch((err) => {
            console.error('update failed', err)
            setBusy(false)
          })
        }}
        disabled={busy}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-60"
      >
        {busy ? 'กำลังอัปเดต…' : 'อัปเดตเลย'}
      </button>
    </div>
  )
}
