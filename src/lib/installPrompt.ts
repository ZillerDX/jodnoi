/**
 * Captures the browser's `beforeinstallprompt` event as early as possible.
 * The event can fire before React mounts; if we only listened inside a component
 * we would miss it and could never offer a one-tap install.
 * Import this module once, first, from main.tsx (it registers listeners on load).
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallSnapshot {
  event: BeforeInstallPromptEvent | null
  installed: boolean
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

let snapshot: InstallSnapshot = { event: null, installed: isStandalone() }
const listeners = new Set<() => void>()

function update(next: Partial<InstallSnapshot>) {
  snapshot = { ...snapshot, ...next }
  listeners.forEach((l) => l())
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault() // keep the event so our own button can trigger the native dialog
  update({ event: e as BeforeInstallPromptEvent })
})

window.addEventListener('appinstalled', () => update({ event: null, installed: true }))

export const subscribeInstall = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export const getInstallSnapshot = () => snapshot

/** Shows the native install dialog. The event can only be used once. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const evt = snapshot.event
  if (!evt) return 'unavailable'
  update({ event: null })
  await evt.prompt()
  const { outcome } = await evt.userChoice
  return outcome
}
