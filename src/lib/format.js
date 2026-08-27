export function formatINR(amount, { compact = false } = {}) {
  const n = Number(amount) || 0
  if (compact) return formatCompactINR(n)
  const sign = n < 0 ? '-' : ''
  const abs = Math.round(Math.abs(n))
  return `${sign}₹${indianGroup(abs)}`
}

function indianGroup(n) {
  const s = String(n)
  if (s.length <= 3) return s
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${grouped},${last3}`
}

export function formatCompactINR(n) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${trimNum(abs / 1_00_00_000)}Cr`
  if (abs >= 1_00_000) return `${sign}₹${trimNum(abs / 1_00_000)}L`
  if (abs >= 1_000) return `${sign}₹${trimNum(abs / 1_000)}K`
  return `${sign}₹${Math.round(abs)}`
}

function trimNum(n) {
  return (Math.round(n * 10) / 10).toString()
}

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...opts })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (isToday) return `Today · ${time}`
  if (isYesterday) return `Yesterday · ${time}`
  return `${formatDate(dateStr)} · ${time}`
}

export function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86400000)
}
