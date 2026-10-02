import { useEffect, useRef, useState } from 'react'
import { AccountProvider } from './components/AccountContext'
import AccountSwitcher from './components/AccountSwitcher'
import InstallButton from './components/InstallButton'
import QuickAddSheet from './components/QuickAddSheet'
import { restoreTransaction } from './db/repo'
import { defaultRange, type RangeState } from './lib/range'
import type { Transaction, TxType } from './lib/types'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import Settings from './pages/Settings'

type Tab = 'home' | 'history' | 'dashboard' | 'settings'
type SheetState = { type: TxType; editing?: Transaction } | null

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'บันทึก', icon: '✎' },
  { id: 'history', label: 'ประวัติ', icon: '☰' },
  { id: 'dashboard', label: 'สรุป', icon: '◔' },
  { id: 'settings', label: 'ตั้งค่า', icon: '⚙' },
]

function AppShell() {
  const [tab, setTab] = useState<Tab>('home')
  const [sheet, setSheet] = useState<SheetState>(null)
  const [range, setRange] = useState<RangeState>(() => defaultRange())
  const [undo, setUndo] = useState<Transaction | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function onDeleted(tx: Transaction) {
    setUndo(tx)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setUndo(null), 5000)
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <AccountSwitcher onManage={() => setTab('settings')} />
        <InstallButton />
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        {tab === 'home' && <Home onAdd={(type) => setSheet({ type })} onEdit={(t) => setSheet({ type: t.type, editing: t })} />}
        {tab === 'history' && <History range={range} onRange={setRange} onEdit={(t) => setSheet({ type: t.type, editing: t })} />}
        {tab === 'dashboard' && <Dashboard range={range} onRange={setRange} />}
        {tab === 'settings' && <Settings />}
      </main>

      {undo && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center justify-between rounded-2xl bg-accent px-4 py-3 text-sm text-accent-ink shadow-lg">
          <span>ลบรายการแล้ว</span>
          <button
            className="font-semibold underline"
            onClick={async () => {
              await restoreTransaction(undo)
              setUndo(null)
            }}
          >
            เลิกทำ
          </button>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${tab === t.id ? 'font-semibold text-ink' : 'text-muted'}`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {sheet && (
        <QuickAddSheet key={sheet.editing?.id ?? sheet.type} type={sheet.type} editing={sheet.editing} onClose={() => setSheet(null)} onDeleted={onDeleted} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AccountProvider>
      <AppShell />
    </AccountProvider>
  )
}
