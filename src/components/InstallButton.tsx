import { useState } from 'react'
import { useInstall } from '../lib/useInstall'
import MiniMascot from './MiniMascot'
import type { Pose } from './mascotBust'
import Modal from './Modal'

const PERKS: { pose: Pose; text: string }[] = [
  { pose: 'fast', text: 'จดเสร็จใน 3 แตะ ไม่ต้องรอโหลด' },
  { pose: 'offline', text: 'ไม่มีเน็ตก็จดได้ ข้อมูลอยู่ในเครื่องคุณ' },
  { pose: 'free', text: 'ไม่ต้องสมัคร ไม่มีโฆษณา' },
]

type View = 'offer' | 'help' | 'done'

/** "ติดตั้ง" button for the header + the install popup. Hidden once the app runs installed. */
export default function InstallButton() {
  const { installed, canPrompt, isIos, install } = useInstall()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('offer')
  const [busy, setBusy] = useState(false)

  // Stay mounted while the popup is open so the success screen can show after `installed` flips.
  if (installed && !open) return null

  const close = () => {
    setOpen(false)
    setView('offer')
  }

  async function onInstall() {
    // Browsers that can install natively hand us the event: one tap, no manual steps.
    if (!canPrompt) return setView('help')
    setBusy(true)
    try {
      const outcome = await install()
      if (outcome === 'accepted') setView('done')
      else if (outcome === 'unavailable') setView('help')
    } catch (err) {
      console.error('install failed', err)
      setView('help')
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
        <Modal title={view === 'done' ? 'พร้อมจดแล้ว' : 'ติดตั้ง Jodnoi'} onClose={close}>
          <div className="space-y-4 text-center">
            {view === 'done' ? (
              <>
                <img src="/mascot.svg" alt="" aria-hidden="true" className="mx-auto h-36 w-36 object-contain" />
                <div>
                  <p className="text-lg font-semibold">Jodnoi อยู่บนหน้าจอโฮมแล้ว</p>
                  <p className="mt-1 text-sm text-muted">แตะไอคอนเมื่อไรก็จดได้เลย อย่าลืมจดนะ!</p>
                </div>
                <button onClick={close} className="w-full rounded-2xl bg-accent py-3.5 text-base font-semibold text-accent-ink">เริ่มจดเลย</button>
              </>
            ) : (
              <>
                <img src="/mascot.svg" alt="" aria-hidden="true" className="mx-auto h-36 w-36 object-contain" />
                <div>
                  <p className="text-lg font-semibold">ให้ Jodnoi อยู่ใกล้มือ</p>
                  <p className="mt-1 text-sm text-muted">แตะไอคอนเดียว จดรายรับรายจ่ายก่อนลืม</p>
                </div>
                <ul className="space-y-2 text-left text-sm">
                  {PERKS.map((p) => (
                    <li key={p.text} className="flex items-center gap-3">
                      <MiniMascot pose={p.pose} />
                      <span className="font-medium">{p.text}</span>
                    </li>
                  ))}
                </ul>
                {view === 'help' && (
                  <p role="status" className="rounded-xl border border-line px-4 py-3 text-left text-sm">
                    {isIos
                      ? 'iPhone/iPad ไม่อนุญาตให้ติดตั้งด้วยปุ่ม: กดปุ่มแชร์ใน Safari แล้วเลือก “เพิ่มไปยังหน้าจอโฮม” (ทำครั้งเดียว)'
                      : 'เบราว์เซอร์นี้ยังติดตั้งให้อัตโนมัติไม่ได้ ลองเปิดหน้านี้ด้วย Chrome หรือ Edge แล้วกดปุ่มอีกครั้ง'}
                  </p>
                )}
                <button
                  onClick={onInstall}
                  disabled={busy}
                  className="w-full rounded-2xl bg-accent py-3.5 text-base font-semibold text-accent-ink disabled:opacity-60"
                >
                  ติดตั้งเลย
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
