import type { DateRange } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function monthRange(ref: Date): DateRange {
  const from = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const to = new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
  return { from: toDateString(from), to: toDateString(to) }
}

export function shiftMonth(ref: Date, delta: number): Date {
  return new Date(ref.getFullYear(), ref.getMonth() + delta, 1)
}

export function lastDaysRange(ref: Date, days: number): DateRange {
  const from = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - (days - 1))
  return { from: toDateString(from), to: toDateString(ref) }
}

export function yearRange(ref: Date): DateRange {
  return {
    from: toDateString(new Date(ref.getFullYear(), 0, 1)),
    to: toDateString(new Date(ref.getFullYear(), 11, 31)),
  }
}

/** Every YYYY-MM-DD from range.from to range.to inclusive. */
export function eachDay(range: DateRange): string[] {
  const out: string[] = []
  const end = parseDateString(range.to)
  for (
    let d = parseDateString(range.from);
    d <= end;
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  ) {
    out.push(toDateString(d))
  }
  return out
}

export function isValidRange(r: DateRange): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(r.from) && /^\d{4}-\d{2}-\d{2}$/.test(r.to) && r.from <= r.to
}

export function formatDateTh(
  s: string,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
  return parseDateString(s).toLocaleDateString('th-TH', opts)
}
