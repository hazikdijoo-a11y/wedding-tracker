// Every derived number in the app is computed here, from the raw
// expenses/payments/vendors/categories/functions tables — nothing financial
// is ever stored pre-aggregated, so totals can never drift out of sync.

export function expenseStatus(expense) {
  const paid = Number(expense.amountPaid) || 0
  const amount = Number(expense.amount) || 0
  if (paid <= 0) return 'Pending'
  if (paid >= amount) return 'Paid'
  return 'Partial'
}

export function expenseBalance(expense) {
  return Math.max(0, (Number(expense.amount) || 0) - (Number(expense.amountPaid) || 0))
}

export function totalPlanned(categories) {
  return sum(categories.map((c) => Number(c.budget) || 0))
}

export function totalSpent(expenses) {
  return sum(expenses.map((e) => Number(e.amount) || 0))
}

export function totalPaid(expenses) {
  return sum(expenses.map((e) => Number(e.amountPaid) || 0))
}

export function totalPending(expenses) {
  return sum(expenses.map(expenseBalance))
}

export function totalAdvances(expenses) {
  return sum(
    expenses.filter((e) => expenseStatus(e) === 'Partial').map((e) => Number(e.amountPaid) || 0)
  )
}

export function byId(arr) {
  const map = new Map()
  for (const item of arr) map.set(item.id, item)
  return map
}

export function groupSum(expenses, key) {
  const map = new Map()
  for (const e of expenses) {
    const k = e[key] || 'uncategorized'
    map.set(k, (map.get(k) || 0) + (Number(e.amount) || 0))
  }
  return map
}

export function categoryBreakdown(categories, expenses) {
  const spentMap = groupSum(expenses, 'categoryId')
  return categories
    .map((c) => {
      const actual = spentMap.get(c.id) || 0
      const planned = Number(c.budget) || 0
      return {
        ...c,
        planned,
        actual,
        remaining: planned - actual,
        overBudget: actual > planned && planned > 0,
      }
    })
    .sort((a, b) => b.actual - a.actual)
}

export function functionBreakdown(functions, expenses) {
  const spentMap = groupSum(expenses, 'functionId')
  return functions
    .map((f) => {
      const spent = spentMap.get(f.id) || 0
      const budget = Number(f.budget) || 0
      return {
        ...f,
        spent,
        remaining: budget - spent,
        pct: budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0,
        overBudget: spent > budget && budget > 0,
      }
    })
    .sort((a, b) => (b.budget || 0) - (a.budget || 0))
}

export function vendorTotals(vendor, expenses) {
  const vendorExpenses = expenses.filter((e) => e.vendorId === vendor.id)
  const billed = sum(vendorExpenses.map((e) => Number(e.amount) || 0))
  const paid = sum(vendorExpenses.map((e) => Number(e.amountPaid) || 0))
  const contract = Number(vendor.contractAmount) || 0
  const basis = contract > 0 ? contract : billed
  return {
    expenses: vendorExpenses,
    billed,
    paid,
    balance: Math.max(0, basis - paid),
    contract: basis,
  }
}

export function contributionTotals(contributions) {
  const map = new Map()
  for (const c of contributions) {
    map.set(c.source, (map.get(c.source) || 0) + (Number(c.amount) || 0))
  }
  return map
}

export function budgetHealth(planned, spent) {
  if (planned <= 0) return 'healthy'
  const pct = spent / planned
  if (pct > 1) return 'over'
  if (pct >= 0.85) return 'watch'
  return 'healthy'
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

export function average(arr) {
  return arr.length ? sum(arr) / arr.length : 0
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

export function timelineSeries(expenses, granularity = 'weekly') {
  const sorted = [...expenses].sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate))
  const buckets = new Map()
  for (const e of sorted) {
    const key = bucketKey(e.expenseDate, granularity)
    buckets.set(key, (buckets.get(key) || 0) + (Number(e.amount) || 0))
  }
  let running = 0
  return [...buckets.entries()]
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([key, amount]) => {
      running += amount
      return { key, amount, cumulative: running }
    })
}

function bucketKey(dateStr, granularity) {
  const d = new Date(dateStr)
  if (granularity === 'daily') return dateStr
  if (granularity === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const onejan = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function paymentsDue(expenses) {
  const pending = expenses.filter((e) => expenseStatus(e) !== 'Paid' && expenseBalance(e) > 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const bucketOf = (e) => {
    if (!e.dueDate) return 'later'
    const d = new Date(e.dueDate + 'T00:00:00')
    const diff = Math.round((d - now) / 86400000)
    if (diff < 0) return 'overdue'
    if (diff === 0) return 'today'
    if (diff <= 7) return 'week'
    return 'later'
  }
  return {
    overdue: pending.filter((e) => bucketOf(e) === 'overdue'),
    today: pending.filter((e) => bucketOf(e) === 'today'),
    week: pending.filter((e) => bucketOf(e) === 'week'),
    later: pending.filter((e) => bucketOf(e) === 'later'),
  }
}
