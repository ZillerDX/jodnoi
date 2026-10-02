export type TxType = 'expense' | 'income'

export interface Category {
  id: string
  type: TxType
  name: string
  icon: string
  color: string
  archived: boolean
  order: number
}

export interface Account {
  id: string
  name: string
  icon: string
  color: string
  archived: boolean
  order: number
}

export interface Transaction {
  id: string
  accountId: string
  type: TxType
  /** Amount in satang (1 baht = 100 satang), always positive. */
  amountSatang: number
  categoryId: string
  /** Local calendar date, YYYY-MM-DD. */
  date: string
  note: string
  createdAt: number
}

export interface DateRange {
  /** Inclusive, YYYY-MM-DD */
  from: string
  /** Inclusive, YYYY-MM-DD */
  to: string
}
