export function bahtToSatang(baht: number): number {
  return Math.round(baht * 100)
}

/** Parses user input like "1,250.50" into satang. Returns null if invalid or <= 0. */
export function parseAmountToSatang(input: string): number | null {
  const cleaned = input.replace(/,/g, '').trim()
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null
  const satang = bahtToSatang(Number(cleaned))
  return satang > 0 ? satang : null
}

export function formatBaht(satang: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(satang) / 100
  const hasFraction = Math.abs(satang) % 100 !== 0
  const text = abs.toLocaleString('th-TH', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })
  const sign = satang < 0 ? '-' : opts.sign && satang > 0 ? '+' : ''
  return `${sign}฿${text}`
}
