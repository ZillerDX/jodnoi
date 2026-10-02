import { isValidRange, lastDaysRange, monthRange, shiftMonth, toDateString, yearRange } from './dates'
import type { DateRange } from './types'

export type RangeState =
  | { kind: 'month'; ref: Date }
  | { kind: 'days'; days: number }
  | { kind: 'year' }
  | { kind: 'custom'; from: string; to: string }

export const defaultRange = (now = new Date()): RangeState => ({ kind: 'month', ref: now })

export function resolveRange(s: RangeState, now = new Date()): DateRange {
  switch (s.kind) {
    case 'month':
      return monthRange(s.ref)
    case 'days':
      return lastDaysRange(now, s.days)
    case 'year':
      return yearRange(now)
    case 'custom': {
      const r = { from: s.from, to: s.to }
      return isValidRange(r) ? r : monthRange(now)
    }
  }
}

export const stepMonth = (ref: Date, delta: number) => shiftMonth(ref, delta)
export const customFromRange = (r: DateRange): RangeState => ({ kind: 'custom', ...r })
export const today = () => toDateString(new Date())
