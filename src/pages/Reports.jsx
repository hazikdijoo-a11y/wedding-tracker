import { useMemo } from 'react'
import { Download, Printer, FileText } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import {
  categoryBreakdown, functionBreakdown, vendorTotals, totalPlanned, totalSpent,
  totalPending, totalPaid,
} from '../lib/calc'
import { formatINR, formatDate } from '../lib/format'
import { EmptyState } from '../components/UI'

export default function Reports() {
  const { wedding, categories, functions, vendors, expenses } = useWedding()

  const catBreak = useMemo(() => categoryBreakdown(categories, expenses), [categories, expenses])
  const fnBreak = useMemo(() => functionBreakdown(functions, expenses), [functions, expenses])
  const vendorBreak = useMemo(() => vendors.map((v) => ({ vendor: v, ...vendorTotals(v, expenses) })), [vendors, expenses])
  const planned = totalPlanned(categories)
  const spent = totalSpent(expenses)
  const paid = totalPaid(expenses)
  const pending = totalPending(expenses)
  const remaining = (wedding?.totalBudget || 0) - spent

  function exportCSV() {
    const rows = [['Wedding Expense Report', wedding?.weddingName || '']]
    rows.push([])
    rows.push(['Summary'])
    rows.push(['Total Budget', wedding?.totalBudget])
    rows.push(['Total Planned', planned])
    rows.push(['Total Spent', spent])
    rows.push(['Total Paid', paid])
    rows.push(['Total Pending', pending])
    rows.push(['Remaining', remaining])
    rows.push([])
    rows.push(['Category', 'Planned', 'Actual', 'Remaining'])
    for (const c of catBreak) rows.push([c.name, c.planned, c.actual, c.remaining])
    rows.push([])
    rows.push(['Function', 'Budget', 'Spent', 'Remaining'])
    for (const f of fnBreak) rows.push([f.name, f.budget, f.spent, f.remaining])
    rows.push([])
    rows.push(['Vendor', 'Contract', 'Paid', 'Balance'])
    for (const v of vendorBreak) rows.push([v.vendor.name, v.contract, v.paid, v.balance])
    rows.push([])
    rows.push(['Expense Date', 'Category', 'Function', 'Vendor', 'Amount', 'Paid', 'Status', 'Method', 'Paid By', 'Notes'])
    for (const e of expenses) {
      const cat = categories.find((c) => c.id === e.categoryId)
      const fn = functions.find((f) => f.id === e.functionId)
      const vendor = vendors.find((v) => v.id === e.vendorId)
      rows.push([e.expenseDate, cat?.name, fn?.name, vendor?.name || '', e.amount, e.amountPaid, e.amount === e.amountPaid ? 'Paid' : e.amountPaid > 0 ? 'Partial' : 'Pending', e.paymentMethod, e.paidBy, (e.notes || '').replace(/\n/g, ' ')])
    }
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(wedding?.weddingName || 'wedding').replace(/\s+/g, '-')}-expense-report.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (expenses.length === 0 && categories.length === 0) {
    return (
      <div>
        <div className="vl-page-head"><h1 className="vl-page-title">Reports</h1></div>
        <div className="vl-card"><EmptyState icon={FileText} title="Nothing to report yet" text="Once you've added a budget and a few expenses, your full wedding report will appear here." /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">Reports</h1>
          <div className="vl-page-sub">Overall Wedding Expense Report</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="vl-btn vl-btn-secondary" onClick={() => window.print()}><Printer size={15} /> Export PDF</button>
          <button className="vl-btn vl-btn-primary" onClick={exportCSV}><Download size={15} /> Export CSV</button>
        </div>
      </div>

      <div id="vl-report-print">
        <div className="vl-stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="vl-stat"><div className="vl-stat-label">Total Budget</div><div className="vl-stat-value">{formatINR(wedding?.totalBudget)}</div></div>
          <div className="vl-stat"><div className="vl-stat-label">Total Spent</div><div className="vl-stat-value">{formatINR(spent)}</div></div>
          <div className="vl-stat"><div className="vl-stat-label">Total Pending</div><div className="vl-stat-value">{formatINR(pending)}</div></div>
          <div className="vl-stat"><div className="vl-stat-label">Remaining</div><div className="vl-stat-value">{formatINR(remaining)}</div></div>
        </div>

        <ReportTable title="Category Breakdown" rows={catBreak} cols={[
          ['Category', (r) => r.name], ['Planned', (r) => formatINR(r.planned)],
          ['Actual', (r) => formatINR(r.actual)], ['Remaining', (r) => formatINR(r.remaining)],
        ]} />

        <ReportTable title="Function Breakdown" rows={fnBreak} cols={[
          ['Function', (r) => r.name], ['Budget', (r) => formatINR(r.budget)],
          ['Spent', (r) => formatINR(r.spent)], ['Remaining', (r) => formatINR(r.remaining)],
        ]} />

        <ReportTable title="Vendor Breakdown" rows={vendorBreak} cols={[
          ['Vendor', (r) => r.vendor.name], ['Contract', (r) => formatINR(r.contract)],
          ['Paid', (r) => formatINR(r.paid)], ['Balance', (r) => formatINR(r.balance)],
        ]} />

        <ReportTable title="Payment Breakdown" rows={[
          { label: 'Fully Paid', value: expenses.filter((e) => e.amountPaid >= e.amount).length },
          { label: 'Partially Paid', value: expenses.filter((e) => e.amountPaid > 0 && e.amountPaid < e.amount).length },
          { label: 'Pending', value: expenses.filter((e) => e.amountPaid <= 0).length },
        ]} cols={[['Status', (r) => r.label], ['Count', (r) => r.value]]} />
      </div>
    </div>
  )
}

function ReportTable({ title, rows, cols }) {
  return (
    <div className="vl-card vl-mt-16 vl-table-wrap">
      <h3 style={{ fontSize: 15, marginBottom: 10 }}>{title}</h3>
      <table className="vl-table">
        <thead><tr>{cols.map(([label]) => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{cols.map(([label, fn]) => <td key={label}>{fn(r)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
