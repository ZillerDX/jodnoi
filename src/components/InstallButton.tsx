import { useState } from 'react'
import { useInstall } from '../lib/useInstall'
import Modal from './Modal'

const BENEFITS = ['เปิดเร็วจากไอคอนบนหน้าจอโฮม', 'ใช้ได้แม้ไม่มีอินเทอร์เน็ต', 'ข้อมูลอยู่ในเครื่องคุณ ไม่ต้องสมัครสมาชิก']

type View = 'offer' | 'manual' | 'done'

/** "ติดตั้ง" button for the header + the install popup. Hidden once the app runs installed. */
export default function InstallButton() {
  const { installed, canPrompt, isIos, install } = useInstall()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('offer')
  const [busy, setBusy] = useState(false)

  // Keep the popup on the success screen even though `installed` flips to true underneath it.
  if (installed && !open) return null

  const close = () => {
    setOpen(false)
    setView('offer')
  }

  async function onInstall() {
    if (!canPrompt) return setView('manual')
    setBusy(true)
    try {
      const outcome = await install()
      if (outcome === 'accepted') setView('done')
      else if (outcome === 'unavailable') setView('manual')
    } catch (err) {
      console.error('install failed', err)
      setView('manual')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!installed && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" />
          </svg>
          ติดตั้ง
        </button>
      )}

      {open && (
        <Modal title={view === 'done' ? 'ติดตั้งเสร็จแล้ว' : 'ติดตั้ง Jodnoi'} onClose={close}>
          <div className="space-y-4 text-center">
            {view === 'done' ? (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-income/15 text-4xl text-income">✓</div>
                <p className="text-sm text-muted">เปิด Jodnoi จากไอคอนบนหน้าจอโฮมได้เลย หรือใช้งานต่อจากหน้านี้</p>
                <button onClick={close} className="w-full rounded-2xl bg-accent py-3.5 text-base font-semibold text-accent-ink">เริ่มใช้งาน</button>
              </>
            ) : (
              <>
                <img src="/icon-192.png" alt="" className="mx-auto h-20 w-20 rounded-3xl" />
                <p className="text-sm text-muted">ใช้งานเต็มจอเหมือนแอปทั่วไป เปิดจากไอคอนบนหน้าจอโฮมได้ทันที</p>
                <ul className="space-y-2 text-left text-sm">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-3 rounded-xl bg-bg px-4 py-3">
                      <span className="text-income">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                {view === 'manual' && (
                  <p role="status" className="rounded-xl border border-line px-4 py-3 text-left text-sm">
                    {isIos
                      ? 'บน iPhone/iPad: กดปุ่มแชร์ใน Safari แล้วเลือก “เพิ่มไปยังหน้าจอโฮม”'
                      : 'เบราว์เซอร์นี้ไม่เปิดหน้าต่างติดตั้งให้อัตโนมัติ ให้เปิดเมนูของเบราว์เซอร์ แล้วเลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอโฮม” (ต้องเปิดผ่าน HTTPS)'}
                  </p>
                )}
                <button
                  onClick={onInstall}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-base font-semibold text-accent-ink disabled:opacity-60"
                >
                  ติดตั้งแอป
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
