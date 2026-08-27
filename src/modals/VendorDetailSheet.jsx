import { useState } from 'react'
import { Mail, Phone, Pencil, Trash2 } from 'lucide-react'
import { Sheet, ProgressBar, ConfirmDialog, StatusBadge } from '../components/UI'
import { useWedding } from '../context/WeddingContext'
import { vendorTotals, expenseStatus } from '../lib/calc'
import { formatINR, formatDate } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import AddVendorSheet from './AddVendorSheet'
import ExpenseDetailSheet from './ExpenseDetailSheet'

export default function VendorDetailSheet({ vendor, onClose }) {
  const { categories, expenses, payments, deleteVendor } = useWedding()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState(null)
  const selectedExpense = expenses.find((e) => e.id === selectedExpenseId) || null

  const category = categories.find((c) => c.id === vendor.categoryId)
  const totals = vendorTotals(vendor, expenses)
  const vendorPayments = payments
    .filter((p) => p.vendorId === vendor.id)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
  const pct = totals.contract > 0 ? Math.min(100, Math.round((totals.paid / totals.contract) * 100)) : 0

  async function handleDelete() {
    await deleteVendor(vendor.id)
    setConfirmDelete(false)
    onClose?.()
  }

  if (editing) return <AddVendorSheet vendor={vendor} onClose={() => setEditing(false)} />

  return (
    <Sheet title="Vendor Profile" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div className="vl-vendor-avatar" style={{ width: 54, height: 54, fontSize: 20 }}>{vendor.name.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{vendor.name}</div>
          <div className="vl-muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            {category ? <CategoryIcon name={category.icon} size={13} /> : null} {category?.name || 'Uncategorized'}
          </div>
        </div>
      </div>

      {(vendor.phone || vendor.email) ? (
        <div className="vl-legend" style={{ marginBottom: 16 }}>
          {vendor.phone ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5 }}><Phone size={14} className="vl-faint" /> {vendor.phone}</div> : null}
          {vendor.email ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5 }}><Mail size={14} className="vl-faint" /> {vendor.email}</div> : null}
        </div>
      ) : null}

      <div className="vl-card" style={{ background: 'var(--gold-tint)', border: 'none', marginBottom: 18 }}>
        <div className="vl-flex-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold-deep)' }}>CONTRACT {formatINR(totals.contract)}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: totals.balance > 0 ? 'var(--red)' : 'var(--green)' }}>
            {totals.balance > 0 ? `${formatINR(totals.balance)} pending` : 'Fully settled'}
          </span>
        </div>
        <ProgressBar pct={pct} state={totals.balance > 0 ? 'watch' : 'good'} />
        <div className="vl-flex-between vl-mt-8" style={{ fontSize: 12.5 }}>
          <span>Paid: <b>{formatINR(totals.paid)}</b></span>
          <span>Balance: <b>{formatINR(totals.balance)}</b></span>
        </div>
      </div>

      {vendor.notes ? (
        <div className="vl-field">
          <label className="vl-field-label">Notes</label>
          <p style={{ fontSize: 13.5 }}>{vendor.notes}</p>
        </div>
      ) : null}

      <div className="vl-section-head">
        <h2 className="vl-section-title" style={{ fontSize: 15 }}>Payment History</h2>
      </div>
      {vendorPayments.length === 0 ? (
        <p className="vl-muted" style={{ fontSize: 13.5, marginBottom: 16 }}>No payments recorded yet.</p>
      ) : (
        <div className="vl-legend" style={{ marginBottom: 18 }}>
          {vendorPayments.map((p) => (
            <div key={p.id} className="vl-flex-between" style={{ fontSize: 13.5, padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div className="vl-faint" style={{ fontSize: 11.5 }}>{formatDate(p.paymentDate)} · {p.paymentMethod}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{formatINR(p.amount)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="vl-section-head">
        <h2 className="vl-section-title" style={{ fontSize: 15 }}>Linked Expenses</h2>
      </div>
      {totals.expenses.length === 0 ? (
        <p className="vl-muted" style={{ fontSize: 13.5, marginBottom: 16 }}>No expenses linked to this vendor yet.</p>
      ) : (
        <div style={{ marginBottom: 8 }}>
          {totals.expenses.map((e) => (
            <div key={e.id} className="vl-expense-row" style={{ padding: '10px 0' }} onClick={() => setSelectedExpenseId(e.id)}>
              <div className="vl-expense-main">
                <div className="vl-expense-title">{formatINR(e.amount)}</div>
                <div className="vl-expense-meta">{formatDate(e.expenseDate)}</div>
              </div>
              <StatusBadge status={expenseStatus(e)} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="vl-btn vl-btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(true)}><Pencil size={15} /> Edit</button>
        <button className="vl-btn vl-btn-danger" style={{ flex: 1 }} onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>
      </div>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete Vendor?"
          message={`This removes "${vendor.name}" from your vendor list. Linked expenses will remain in your records.`}
          confirmLabel="Delete Vendor"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : null}

      {selectedExpense ? <ExpenseDetailSheet expense={selectedExpense} onClose={() => setSelectedExpenseId(null)} /> : null}
    </Sheet>
  )
}
