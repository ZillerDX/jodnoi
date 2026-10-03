import { registerSW } from 'virtual:pwa-register'

/**
 * Service-worker update flow: when a new version has been downloaded we do NOT reload silently
 * (that could interrupt someone mid-entry); we expose `needRefresh` so the UI can ask,
 * and `applyUpdate()` activates the new version and reloads. Data in IndexedDB is untouched.
 */

export interface UpdateSnapshot {
  needRefresh: boolean
}

const CHECK_EVERY_MS = 30 * 60 * 1000

let snapshot: UpdateSnapshot = { needRefresh: false }
const listeners = new Set<() => void>()
let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

function setSnapshot(next: UpdateSnapshot) {
  snapshot = next
  listeners.forEach((l) => l())
}

export function initUpdateCheck() {
  updateSW = registerSW({
    onNeedRefresh() {
      setSnapshot({ needRefresh: true })
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // An installed PWA can stay open for days: look for a new version periodically and on return.
      const check = () => {
        if (!navigator.onLine) return
        registration.update().catch((err) => console.warn('update check failed', err))
      }
      window.setInterval(check, CHECK_EVERY_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    },
    onRegisterError(err) {
      console.error('service worker registration failed', err)
    },
  })
}

export const subscribeUpdate = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
export const getUpdateSnapshot = () => snapshot
export const applyUpdate = () => updateSW?.(true)
export const dismissUpdate = () => setSnapshot({ needRefresh: false })
