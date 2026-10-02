import { useEffect, type ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  /** Use role="alertdialog" for confirmations. */
  alert?: boolean
}

/** Centered popup with dimmed backdrop. Closes on backdrop click or Escape. */
export default function Modal({ title, onClose, children, alert }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="ปิด" className="-mr-2 rounded-full p-2 text-muted">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
