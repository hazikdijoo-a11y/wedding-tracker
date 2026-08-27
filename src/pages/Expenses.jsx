import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, Wallet, Plus, X } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { expenseStatus } from '../lib/calc'
import { formatINR, formatDate } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import { EmptyState, StatusBadge } from '../components/UI'
import AddExpenseSheet from '../modals/AddExpenseSheet'
import ExpenseDetailSheet from '../modals/ExpenseDetailSheet'

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'highest', label: 'Highest amount' },
  { key: 'lowest', label: 'Lowest amount' },
  { key: 'pending', label: 'Pending first' },
]

export default function Expenses() {
  const { categories, functions, vendors, expenses } = useWedding()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState(params.get('category') || 'All')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const selected = expenses.find((e) => e.id === selectedId) || null

  const filtered = useMemo(() => {
    let list = [...expenses]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((e) => {
        const cat = categories.find((c) => c.id === e.categoryId)?.name || ''
        const vendor = vendors.find((v) => v.id === e.vendorId)?.name || ''
        return cat.toLowerCase().includes(q) || vendor.toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q)
      })
    }
    if (statusFilter !== 'All') list = list.filter((e) => expenseStatus(e) === statusFilter)
    if (categoryFilter !== 'All') list = list.filter((e) => e.categoryId === categoryFilter)

    switch (sort) {
      case 'oldest': list.sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate)); break
      case 'highest': list.sort((a, b) => b.amount - a.amount); break
      case 'lowest': list.sort((a, b) => a.amount - b.amount); break
      case 'pending': list.sort((a, b) => (expenseStatus(a) === 'Paid' ? 1 : 0) - (expenseStatus(b) === 'Paid' ? 1 : 0)); break
      default: list.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
    }
    return list
  }, [expenses, query, statusFilter, categoryFilter, sort, categories, vendors])

  const total = filtered.reduce((a, e) => a + e.amount, 0)

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">All Expenses</h1>
          <div className="vl-page-sub">{filtered.length} expenses · {formatINR(total, { compact: true })} total</div>
        </div>
        <button className="vl-btn vl-btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Expense</button>
      </div>

      <div className="vl-search">
        <Search size={17} color="var(--charcoal-faint)" />
        <input placeholder="Search expenses, vendors, categories…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="vl-iconbtn" onClick={() => setShowFilters((s) => !s)}><SlidersHorizontal size={15} /></button>
      </div>

      <div className="vl-filter-row">
        {['All', 'Paid', 'Partial', 'Pending'].map((s) => (
          <button key={s} className={`vl-filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      {showFilters ? (
        <div className="vl-card" style={{ marginBottom: 16 }}>
          <div className="vl-flex-between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>Filters</span>
            <button className="vl-iconbtn" onClick={() => setShowFilters(false)}><X size={14} /></button>
          </div>
          <div className="vl-field">
            <label className="vl-field-label">Category</label>
            <div className="vl-pill-row">
              <button className={`vl-pill${categoryFilter === 'All' ? ' selected' : ''}`} onClick={() => setCategoryFilter('All')}>All</button>
              {categories.map((c) => (
                <button key={c.id} className={`vl-pill${categoryFilter === c.id ? ' selected' : ''}`} onClick={() => setCategoryFilter(c.id)}>{c.name}</button>
              ))}
            </div>
          </div>
          <div className="vl-field" style={{ marginBottom: 0 }}>
            <label className="vl-field-label">Sort By</label>
            <div className="vl-pill-row">
              {SORTS.map((s) => (
                <button key={s.key} className={`vl-pill${sort === s.key ? ' selected' : ''}`} onClick={() => setSort(s.key)}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="vl-card vl-card-flush">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={expenses.length === 0 ? 'Your wedding budget is waiting for its first expense.' : 'No expenses match your filters'}
            text={expenses.length === 0 ? 'Start tracking every rupee so you always know where you stand.' : 'Try adjusting your search or filters.'}
            action={expenses.length === 0 ? <button className="vl-btn vl-btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add First Expense</button> : null}
          />
        ) : (
          filtered.map((e) => {
            const cat = categories.find((c) => c.id === e.categoryId)
            const fn = functions.find((f) => f.id === e.functionId)
            const vendor = vendors.find((v) => v.id === e.vendorId)
            return (
              <div key={e.id} className="vl-expense-row" onClick={() => setSelectedId(e.id)}>
                <div className="vl-expense-icon"><CategoryIcon name={cat?.icon} size={19} /></div>
                <div className="vl-expense-main">
                  <div className="vl-expense-title">{vendor?.name || cat?.name}</div>
                  <div className="vl-expense-meta">{cat?.name} · {fn?.name}</div>
                </div>
                <div className="vl-expense-right">
                  <div className="vl-expense-amount">{formatINR(e.amount)}</div>
                  <StatusBadge status={expenseStatus(e)} />
                  <div className="vl-expense-date">{formatDate(e.expenseDate)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showAdd ? <AddExpenseSheet onClose={() => setShowAdd(false)} /> : null}
      {selected ? <ExpenseDetailSheet expense={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  )
}
