import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, Target, TrendingDown, Clock, HandCoins, PiggyBank, Plus, Store, CreditCard,
  Gem, Receipt, CheckCircle2, AlertTriangle, PartyPopper, ArrowRight, Sparkles,
} from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import {
  totalPlanned, totalSpent, totalPending, totalAdvances, budgetHealth,
  categoryBreakdown, paymentsDue, expenseBalance,
} from '../lib/calc'
import { formatINR, formatDate, formatDateTime, daysUntil } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import { ProgressBar, StatCard, CircularProgress } from '../components/UI'
import AddExpenseSheet from '../modals/AddExpenseSheet'
import AddVendorSheet from '../modals/AddVendorSheet'

export default function Dashboard() {
  const { wedding, categories, expenses, vendors, payments } = useWedding()
  const navigate = useNavigate()
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddVendor, setShowAddVendor] = useState(false)

  const planned = totalPlanned(categories)
  const spent = totalSpent(expenses)
  const pending = totalPending(expenses)
  const advances = totalAdvances(expenses)
  const remaining = (wedding?.totalBudget || 0) - spent
  const pct = wedding?.totalBudget ? Math.round((spent / wedding.totalBudget) * 100) : 0
  const health = budgetHealth(wedding?.totalBudget || 0, spent)
  const fillState = health === 'over' ? 'over' : health === 'watch' ? 'watch' : 'good'

  const catBreak = useMemo(() => categoryBreakdown(categories, expenses).filter((c) => c.actual > 0), [categories, expenses])
  const due = useMemo(() => paymentsDue(expenses), [expenses])
  const dueSoon = [...due.overdue, ...due.today, ...due.week].slice(0, 3)

  const daysToWedding = wedding?.weddingDate ? daysUntil(wedding.weddingDate) : null

  const recentActivity = useMemo(() => {
    const items = []
    for (const e of expenses) {
      const cat = categories.find((c) => c.id === e.categoryId)
      items.push({ id: e.id, time: e.createdAt, text: `${formatINR(e.amount)} added for ${cat?.name || 'expense'}`, kind: 'expense' })
    }
    for (const p of payments) {
      const v = vendors.find((v) => v.id === p.vendorId)
      items.push({ id: p.id, time: p.createdAt, text: `${formatINR(p.amount)} paid${v ? ` to ${v.name}` : ''}`, kind: 'payment' })
    }
    for (const v of vendors) {
      items.push({ id: `v-${v.id}`, time: v.createdAt, text: `Vendor "${v.name}" added`, kind: 'vendor' })
    }
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6)
  }, [expenses, payments, vendors, categories])

  const biggestExpense = useMemo(() => [...expenses].sort((a, b) => b.amount - a.amount)[0], [expenses])
  const biggestCategory = catBreak[0]
  const highestPendingVendor = useMemo(() => {
    const map = new Map()
    for (const e of expenses) {
      const bal = expenseBalance(e)
      if (bal > 0 && e.vendorId) map.set(e.vendorId, (map.get(e.vendorId) || 0) + bal)
    }
    let top = null
    for (const [id, amt] of map.entries()) if (!top || amt > top.amt) top = { id, amt }
    if (!top) return null
    return { vendor: vendors.find((v) => v.id === top.id), amount: top.amt }
  }, [expenses, vendors])
  const avgExpense = expenses.length ? spent / expenses.length : 0

  const overBudgetCats = catBreak.filter((c) => c.overBudget)
  const watchCats = catBreak.filter((c) => !c.overBudget && c.planned > 0 && c.actual / c.planned >= 0.85)

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">{wedding?.weddingName}</h1>
          <div className="vl-page-sub">
            Wedding Date: {formatDate(wedding?.weddingDate)}
            {daysToWedding != null && daysToWedding >= 0 ? ` · ${daysToWedding} days to go` : ''}
          </div>
        </div>
        <button className="vl-btn vl-btn-primary" onClick={() => setShowAddExpense(true)}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="vl-stat-grid">
        <StatCard icon={Target} iconBg="var(--gold-tint)" iconColor="var(--gold-deep)" label="Total Budget" value={formatINR(wedding?.totalBudget, { compact: true })} />
        <StatCard icon={PiggyBank} iconBg="var(--blush-soft)" iconColor="var(--blush)" label="Total Planned" value={formatINR(planned, { compact: true })} />
        <StatCard icon={Wallet} iconBg="var(--green-soft)" iconColor="var(--green)" label="Total Spent" value={formatINR(spent, { compact: true })} delta={`${pct}% used`} deltaKind={fillState === 'over' ? 'bad' : fillState === 'watch' ? 'neutral' : 'good'} />
        <StatCard icon={TrendingDown} iconBg={remaining < 0 ? 'var(--red-soft)' : 'var(--green-soft)'} iconColor={remaining < 0 ? 'var(--red)' : 'var(--green)'} label="Remaining" value={formatINR(remaining, { compact: true })} />
        <StatCard icon={Clock} iconBg="var(--amber-soft)" iconColor="var(--amber)" label="Pending Payments" value={formatINR(pending, { compact: true })} />
        <StatCard icon={HandCoins} iconBg="var(--gold-tint)" iconColor="var(--gold-deep)" label="Advances Paid" value={formatINR(advances, { compact: true })} />
      </div>

      <div className="vl-card vl-mt-16">
        <div className="vl-budget-hero">
          <CircularProgress pct={pct} state={fillState} size={140}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700 }}>{pct}%</div>
            <div className="vl-faint" style={{ fontSize: 11.5, fontWeight: 600 }}>USED</div>
          </CircularProgress>
          <div className="vl-budget-numbers">
            <div>
              <div className="vl-page-sub" style={{ marginBottom: 2 }}>Wedding Budget</div>
              <div className="vl-budget-amount" style={{ fontFamily: "'Fraunces', serif" }}>
                {formatINR(spent)} <span className="vl-budget-of">spent of {formatINR(wedding?.totalBudget)}</span>
              </div>
            </div>
            <ProgressBar pct={pct} state={fillState} height={16} />
            <div className="vl-flex-between">
              <span className="vl-muted" style={{ fontSize: 13 }}>{pct}% Used</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: remaining < 0 ? 'var(--red)' : 'var(--green)' }}>
                {remaining < 0 ? `${formatINR(Math.abs(remaining))} over` : `${formatINR(remaining)} remaining`}
              </span>
            </div>
            {overBudgetCats.length ? (
              <div className="vl-alert vl-alert-over">
                <AlertTriangle size={17} className="vl-alert-icon" />
                <div>
                  <div className="vl-alert-title">{overBudgetCats[0].name} Budget Exceeded</div>
                  <div className="vl-alert-text">You are {formatINR(overBudgetCats[0].actual - overBudgetCats[0].planned)} over your planned {overBudgetCats[0].name.toLowerCase()} budget.</div>
                </div>
              </div>
            ) : watchCats.length ? (
              <div className="vl-alert vl-alert-watch">
                <AlertTriangle size={17} className="vl-alert-icon" />
                <div>
                  <div className="vl-alert-title">{watchCats[0].name} Budget Alert</div>
                  <div className="vl-alert-text">You have used {Math.round((watchCats[0].actual / watchCats[0].planned) * 100)}% of your {watchCats[0].name.toLowerCase()} budget.</div>
                </div>
              </div>
            ) : remaining > 0 ? (
              <div className="vl-alert vl-alert-good">
                <PartyPopper size={17} className="vl-alert-icon" />
                <div>
                  <div className="vl-alert-title">Great Job</div>
                  <div className="vl-alert-text">You're currently {formatINR(remaining)} under your overall budget.</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="vl-section-head vl-mt-24">
        <h2 className="vl-section-title">Quick Actions</h2>
      </div>
      <div className="vl-filter-row" style={{ marginBottom: 8 }}>
        <QuickAction icon={Plus} label="Add Expense" onClick={() => setShowAddExpense(true)} />
        <QuickAction icon={Store} label="Add Vendor" onClick={() => setShowAddVendor(true)} />
        <QuickAction icon={CreditCard} label="Add Payment" onClick={() => navigate('/payments')} />
        <QuickAction icon={Target} label="Edit Budget" onClick={() => navigate('/budget')} />
        <QuickAction icon={Gem} label="Add Function" onClick={() => navigate('/functions')} />
        <QuickAction icon={Receipt} label="Upload Receipt" onClick={() => setShowAddExpense(true)} />
      </div>

      <div className="vl-grid-2 vl-mt-16">
        <div className="vl-card">
          <div className="vl-section-head">
            <h2 className="vl-section-title">Where Is The Money Going?</h2>
            <button className="vl-link-btn" onClick={() => navigate('/analytics')}>View all <ArrowRight size={12} /></button>
          </div>
          {catBreak.length === 0 ? (
            <p className="vl-muted" style={{ fontSize: 13.5 }}>Add your first expense to see the breakdown.</p>
          ) : (
            <div className="vl-legend">
              {catBreak.slice(0, 6).map((c) => (
                <div key={c.id} className="vl-legend-row" onClick={() => navigate(`/expenses?category=${c.id}`)}>
                  <span className="vl-chip-icon" style={{ width: 30, height: 30 }}><CategoryIcon name={c.icon} size={15} /></span>
                  <span className="vl-legend-name">{c.name}</span>
                  <span className="vl-legend-pct">{spent > 0 ? Math.round((c.actual / spent) * 100) : 0}%</span>
                  <span style={{ fontWeight: 700, fontSize: 13.5, width: 84, textAlign: 'right' }}>{formatINR(c.actual, { compact: true })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vl-card">
          <div className="vl-section-head">
            <h2 className="vl-section-title">Payments Due</h2>
            <button className="vl-link-btn" onClick={() => navigate('/payments')}>View all <ArrowRight size={12} /></button>
          </div>
          {dueSoon.length === 0 ? (
            <p className="vl-muted" style={{ fontSize: 13.5 }}>Nothing due — you're all caught up.</p>
          ) : (
            <div>
              {dueSoon.map((e) => {
                const vendor = vendors.find((v) => v.id === e.vendorId)
                const cat = categories.find((c) => c.id === e.categoryId)
                const isOverdue = due.overdue.includes(e)
                const isToday = due.today.includes(e)
                return (
                  <div key={e.id} className="vl-expense-row" style={{ padding: '11px 0' }} onClick={() => navigate('/payments')}>
                    <span style={{ fontSize: 16 }}>{isOverdue ? '🔴' : isToday ? '🟠' : '🟡'}</span>
                    <div className="vl-expense-main">
                      <div className="vl-expense-title">{vendor?.name || cat?.name || 'Expense'}</div>
                      <div className="vl-expense-meta">{isOverdue ? 'Overdue' : isToday ? 'Due today' : `Due ${formatDate(e.dueDate)}`}</div>
                    </div>
                    <div className="vl-expense-amount">{formatINR(expenseBalance(e), { compact: true })}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="vl-grid-2 vl-mt-16">
        <div className="vl-card">
          <div className="vl-section-head"><h2 className="vl-section-title">Recent Activity</h2></div>
          {recentActivity.length === 0 ? (
            <p className="vl-muted" style={{ fontSize: 13.5 }}>Your activity feed will appear here.</p>
          ) : recentActivity.map((a) => (
            <div key={a.id} className="vl-activity-row">
              <div className="vl-activity-dot"><CheckCircle2 size={15} /></div>
              <div>
                <div className="vl-activity-text">{a.text}</div>
                <div className="vl-activity-time">{formatDateTime(a.time)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="vl-card">
          <div className="vl-section-head"><h2 className="vl-section-title">Smart Insights</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InsightRow icon={Sparkles} label="Biggest Expense" value={biggestExpense ? `${formatINR(biggestExpense.amount, { compact: true })} · ${categories.find(c => c.id === biggestExpense.categoryId)?.name || ''}` : '—'} />
            <InsightRow icon={Sparkles} label="Most Expensive Category" value={biggestCategory ? biggestCategory.name : '—'} />
            <InsightRow icon={Sparkles} label="Highest Pending Payment" value={highestPendingVendor ? `${highestPendingVendor.vendor?.name || 'Vendor'} — ${formatINR(highestPendingVendor.amount, { compact: true })}` : '—'} />
            <InsightRow icon={Sparkles} label="Average Expense" value={formatINR(avgExpense, { compact: true })} />
            <InsightRow icon={Sparkles} label="Budget Health" value={health === 'over' ? 'Over Budget' : health === 'watch' ? 'Watch' : 'Healthy'} />
          </div>
        </div>
      </div>

      {showAddExpense ? <AddExpenseSheet onClose={() => setShowAddExpense(false)} /> : null}
      {showAddVendor ? <AddVendorSheet onClose={() => setShowAddVendor(false)} /> : null}
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button className="vl-filter-chip" onClick={onClick} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 16px', minWidth: 84 }}>
      <Icon size={18} />
      {label}
    </button>
  )
}

function InsightRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="vl-muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 13.5, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
