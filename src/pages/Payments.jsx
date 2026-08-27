import { useMemo, useState } from 'react'
import { CreditCard, CheckCircle2 } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { paymentsDue, expenseBalance } from '../lib/calc'
import { formatINR, formatDate } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import { EmptyState } from '../components/UI'
import ExpenseDetailSheet from '../modals/ExpenseDetailSheet'

export default function Payments() {
  const { categories, vendors, expenses, payments } = useWedding()
  const [selectedId, setSelectedId] = useState(null)
  const selected = expenses.find((e) => e.id === selectedId) || null
  const due = useMemo(() => paymentsDue(expenses), [expenses])

  const allPayments = useMemo(
    () => [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)),
    [payments]
  )

  const totalDue = due.overdue.concat(due.today, due.week, due.later).reduce((a, e) => a + expenseBalance(e), 0)

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">Payments</h1>
          <div className="vl-page-sub">{formatINR(totalDue, { compact: true })} owed across all vendors</div>
        </div>
      </div>

      <div className="vl-section-head"><h2 className="vl-section-title">Payments Due</h2></div>
      {due.overdue.length + due.today.length + due.week.length + due.later.length === 0 ? (
        <div className="vl-card vl-mt-16">
          <EmptyState icon={CheckCircle2} title="You're all caught up" text="No pending payments right now. Nicely done." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
          <DueBucket title="🔴 Due Today / Overdue" items={[...due.overdue, ...due.today]} categories={categories} vendors={vendors} onSelect={setSelectedId} />
          <DueBucket title="🟠 Due This Week" items={due.week} categories={categories} vendors={vendors} onSelect={setSelectedId} />
          <DueBucket title="🟡 Due Later" items={due.later} categories={categories} vendors={vendors} onSelect={setSelectedId} />
        </div>
      )}

      <div className="vl-section-head"><h2 className="vl-section-title">Payment History</h2></div>
      <div className="vl-card vl-card-flush">
        {allPayments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments logged yet" text="Payments you record against expenses will appear here." />
        ) : (
          allPayments.map((p) => {
            const vendor = vendors.find((v) => v.id === p.vendorId)
            return (
              <div key={p.id} className="vl-expense-row">
                <div className="vl-expense-icon"><CreditCard size={18} /></div>
                <div className="vl-expense-main">
                  <div className="vl-expense-title">{p.label}{vendor ? ` · ${vendor.name}` : ''}</div>
                  <div className="vl-expense-meta">{p.paymentMethod}</div>
                </div>
                <div className="vl-expense-right">
                  <div className="vl-expense-amount">{formatINR(p.amount)}</div>
                  <div className="vl-expense-date">{formatDate(p.paymentDate)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {selected ? <ExpenseDetailSheet expense={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  )
}

function DueBucket({ title, items, categories, vendors, onSelect }) {
  if (items.length === 0) return null
  return (
    <div className="vl-card">
      <div className="vl-section-head" style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 14.5 }}>{title}</h3>
        <span className="vl-faint" style={{ fontSize: 12.5 }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
      </div>
      {items.map((e) => {
        const cat = categories.find((c) => c.id === e.categoryId)
        const vendor = vendors.find((v) => v.id === e.vendorId)
        return (
          <div key={e.id} className="vl-expense-row" style={{ padding: '10px 0' }} onClick={() => onSelect(e.id)}>
            <div className="vl-expense-icon"><CategoryIcon name={cat?.icon} size={18} /></div>
            <div className="vl-expense-main">
              <div className="vl-expense-title">{vendor?.name || cat?.name}</div>
              <div className="vl-expense-meta">{e.dueDate ? `Due ${formatDate(e.dueDate)}` : 'No due date set'}</div>
            </div>
            <div className="vl-expense-amount">{formatINR(expenseBalance(e))}</div>
          </div>
        )
      })}
    </div>
  )
}
