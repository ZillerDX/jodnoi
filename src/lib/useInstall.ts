import { useSyncExternalStore } from 'react'
import { getInstallSnapshot, promptInstall, subscribeInstall } from './installPrompt'

export type { InstallOutcome } from './useInstall.types'

export function useInstall() {
  const { event, installed } = useSyncExternalStore(subscribeInstall, getInstallSnapshot)
  return {
    installed,
    canPrompt: event !== null,
    isIos: /iphone|ipad|ipod/i.test(navigator.userAgent),
    install: promptInstall,
  }
}
