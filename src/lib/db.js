import Dexie from 'dexie'

export const db = new Dexie('vowledger')

db.version(1).stores({
  weddings: 'id',
  categories: 'id, weddingId',
  functions: 'id, weddingId',
  vendors: 'id, weddingId, categoryId',
  expenses: 'id, weddingId, categoryId, functionId, vendorId, expenseDate',
  payments: 'id, weddingId, expenseId, vendorId, paymentDate',
  contributions: 'id, weddingId',
})

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

export const DEFAULT_CATEGORIES = [
  { name: 'Venue', icon: 'landmark' },
  { name: 'Catering', icon: 'utensils' },
  { name: 'Decoration', icon: 'flower-2' },
  { name: 'Photography', icon: 'camera' },
  { name: 'Videography', icon: 'video' },
  { name: 'Makeup', icon: 'sparkles' },
  { name: 'Jewellery', icon: 'gem' },
  { name: 'Clothing', icon: 'shirt' },
  { name: 'Invitations', icon: 'mail' },
  { name: 'Entertainment', icon: 'music-4' },
  { name: 'Transportation', icon: 'car' },
  { name: 'Accommodation', icon: 'bed-double' },
  { name: 'Gifts', icon: 'gift' },
  { name: 'Priest / Ceremony', icon: 'flame' },
  { name: 'Music / DJ', icon: 'disc-3' },
  { name: 'Flowers', icon: 'flower' },
  { name: 'Mehendi', icon: 'hand' },
  { name: 'Miscellaneous', icon: 'more-horizontal' },
]

export const DEFAULT_FUNCTIONS = [
  'Engagement',
  'Haldi',
  'Mehendi',
  'Sangeet',
  'Wedding',
  'Reception',
  'Post-Wedding',
  'General',
]

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Other']
export const PAID_BY_OPTIONS = ["Bride", "Groom", "Bride's Family", "Groom's Family", 'Parents', 'Other']
export const CONTRIBUTION_SOURCES = ["Bride's Family", "Groom's Family", 'Bride', 'Groom', 'Loans', 'Savings', 'Other']
