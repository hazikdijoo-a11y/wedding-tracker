import { useState } from 'react'
import { Copy, Pencil, Trash2, Paperclip, Plus } from 'lucide-react'
import { Sheet, StatusBadge, ConfirmDialog, ProgressBar } from '../components/UI'
import { useWedding } from '../context/WeddingContext'
import { CategoryIcon } from '../lib/icons'
import { expenseStatus, expenseBalance } from '../lib/calc'
import { formatINR, formatDate, todayISO } from '../lib/format'
import { PAYMENT_METHODS } from '../lib/db'
import AddExpenseSheet from './AddExpenseSheet'

export default function ExpenseDetailSheet({ expense, onClose }) {
  const { categories, functions, vendors, deleteExpense, duplicateExpense, addPaymentToExpense, updateExpense } = useWedding()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addingPayment, setAddingPayment] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState(expense.paymentMethod)
  const [noteDraft, setNoteDraft] = useState(expense.notes || '')
  const [editingNote, setEditingNote] = useState(false)

  const category = categories.find((c) => c.id === expense.categoryId)
  const fn = functions.find((f) => f.id === expense.functionId)
  const vendor = vendors.find((v) => v.id === expense.vendorId)
  const status = expenseStatus(expense)
  const balance = expenseBalance(expense)

  async function handleDelete() {
    await deleteExpense(expense.id)
    setConfirmDelete(false)
    onClose?.()
  }

  async function handleDuplicate() {
    await duplicateExpense(expense.id)
    onClose?.()
  }

  async function handleAddPayment() {
    const amt = Number(payAmount) || 0
    if (amt <= 0) return
    await addPaymentToExpense(expense.id, { amount: amt, paymentMethod: payMethod, paymentDate: todayISO() })
    setAddingPayment(false)
    setPayAmount('')
  }

  async function saveNote() {
    await updateExpense(expense.id, { notes: noteDraft })
    setEditingNote(false)
  }

  if (editing) return <AddExpenseSheetEdit expense={expense} onClose={() => { setEditing(false); onClose?.() }} />

  return (
    <Sheet title="Expense Details" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div className="vl-expense-icon" style={{ width: 52, height: 52 }}>
          <CategoryIcon name={category?.icon} size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontFamily: "'Fraunces', serif", fontWeight: 600 }}>{formatINR(expense.amount)}</div>
          <div className="vl-muted" style={{ fontSize: 13 }}>{category?.name} · {fn?.name}{vendor ? ` · ${vendor.name}` : ''}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      {status !== 'Paid' ? (
        <div className="vl-card" style={{ padding: 14, marginBottom: 16, background: 'var(--gold-tint)', border: 'none' }}>
          <div className="vl-flex-between" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold-deep)' }}>PAID {formatINR(expense.amountPaid)} OF {formatINR(expense.amount)}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--red)' }}>{formatINR(balance)} left</span>
          </div>
          <ProgressBar pct={(expense.amountPaid / expense.amount) * 100} state="watch" />
        </div>
      ) : null}

      <div className="vl-legend" style={{ marginBottom: 18 }}>
        <DetailRow label="Payment Method" value={expense.paymentMethod} />
        <DetailRow label="Paid By" value={expense.paidBy} />
        <DetailRow label="Date" value={formatDate(expense.expenseDate)} />
        {expense.dueDate ? <DetailRow label="Due Date" value={formatDate(expense.dueDate)} /> : null}
      </div>

      <div className="vl-field">
        <div className="vl-flex-between">
          <label className="vl-field-label">Notes</label>
          {!editingNote ? <button className="vl-link-btn" onClick={() => setEditingNote(true)}>{expense.notes ? 'Edit' : 'Add note'}</button> : null}
        </div>
        {editingNote ? (
          <div>
            <textarea className="vl-textarea" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} autoFocus />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="vl-btn vl-btn-primary vl-btn-sm" onClick={saveNote}>Save</button>
              <button className="vl-btn vl-btn-ghost vl-btn-sm" onClick={() => { setEditingNote(false); setNoteDraft(expense.notes || '') }}>Cancel</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13.5, color: expense.notes ? 'var(--charcoal)' : 'var(--charcoal-faint)' }}>{expense.notes || 'No notes added.'}</p>
        )}
      </div>

      {expense.receiptDataUrl ? (
        <div className="vl-field">
          <label className="vl-field-label">Receipt</label>
          {expense.receiptDataUrl.startsWith('data:image') ? (
            <img src={expense.receiptDataUrl} alt="Receipt" style={{ width: '100%', borderRadius: 14, border: '1px solid var(--line)' }} />
          ) : (
            <a href={expense.receiptDataUrl} target="_blank" rel="noreferrer" className="vl-btn vl-btn-secondary"><Paperclip size={15} /> View PDF Receipt</a>
          )}
        </div>
      ) : null}

      {status !== 'Paid' ? (
        <div className="vl-field">
          {!addingPayment ? (
            <button className="vl-btn vl-btn-secondary vl-btn-block" onClick={() => setAddingPayment(true)}><Plus size={15} /> Add Payment</button>
          ) : (
            <div className="vl-card" style={{ padding: 14 }}>
              <div className="vl-field" style={{ marginBottom: 10 }}>
                <label className="vl-field-label">Amount</label>
                <input className="vl-input" inputMode="decimal" placeholder={`Up to ${formatINR(balance)}`} value={payAmount} onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ''))} autoFocus />
              </div>
              <div className="vl-pill-row" style={{ marginBottom: 12 }}>
                {PAYMENT_METHODS.map((m) => (
                  <button type="button" key={m} className={`vl-pill${payMethod === m ? ' selected' : ''}`} onClick={() => setPayMethod(m)}>{m}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="vl-btn vl-btn-primary" onClick={handleAddPayment}>Record Payment</button>
                <button className="vl-btn vl-btn-ghost" onClick={() => setAddingPayment(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="vl-btn vl-btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(true)}><Pencil size={15} /> Edit</button>
        <button className="vl-btn vl-btn-secondary" style={{ flex: 1 }} onClick={handleDuplicate}><Copy size={15} /> Duplicate</button>
        <button className="vl-btn vl-btn-danger" style={{ flex: 1 }} onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>
      </div>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete Expense?"
          message={`This will remove ${formatINR(expense.amount)} from your wedding expense records.`}
          confirmLabel="Delete Expense"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : null}
    </Sheet>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="vl-flex-between" style={{ fontSize: 13.5 }}>
      <span className="vl-muted">{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function AddExpenseSheetEdit({ expense, onClose }) {
  const { updateExpense } = useWedding()
  return (
    <EditExpenseForm expense={expense} onSave={async (patch) => { await updateExpense(expense.id, patch); onClose() }} onClose={onClose} />
  )
}

function EditExpenseForm({ expense, onSave, onClose }) {
  const { categories, functions, vendors } = useWedding()
  const [amount, setAmount] = useState(String(expense.amount))
  const [categoryId, setCategoryId] = useState(expense.categoryId)
  const [functionId, setFunctionId] = useState(expense.functionId)
  const [vendorId, setVendorId] = useState(expense.vendorId || '')
  const [method, setMethod] = useState(expense.paymentMethod)
  const [date, setDate] = useState(expense.expenseDate)
  const [notes, setNotes] = useState(expense.notes || '')

  const filteredVendors = categoryId ? vendors.filter((v) => v.categoryId === categoryId) : vendors

  return (
    <Sheet
      title="Edit Expense"
      onClose={onClose}
      footer={<button className="vl-btn vl-btn-primary vl-btn-block" onClick={() => onSave({ amount: Number(amount) || 0, categoryId, functionId, vendorId: vendorId || null, paymentMethod: method, expenseDate: date, notes })}>Save Changes</button>}
    >
      <div className="vl-amount-wrap">
        <span className="vl-amount-symbol">₹</span>
        <input className="vl-amount-input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Category</label>
        <div className="vl-chip-grid">
          {categories.map((c) => (
            <button type="button" key={c.id} className={`vl-chip${categoryId === c.id ? ' selected' : ''}`} onClick={() => setCategoryId(c.id)}>
              <span className="vl-chip-icon"><CategoryIcon name={c.icon} size={17} /></span>{c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Event / Function</label>
        <div className="vl-pill-row">
          {functions.map((f) => (
            <button type="button" key={f.id} className={`vl-pill${functionId === f.id ? ' selected' : ''}`} onClick={() => setFunctionId(f.id)}>{f.name}</button>
          ))}
        </div>
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Vendor</label>
        <div className="vl-pill-row">
          <button type="button" className={`vl-pill${!vendorId ? ' selected' : ''}`} onClick={() => setVendorId('')}>None</button>
          {filteredVendors.map((v) => (
            <button type="button" key={v.id} className={`vl-pill${vendorId === v.id ? ' selected' : ''}`} onClick={() => setVendorId(v.id)}>{v.name}</button>
          ))}
        </div>
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Payment Method</label>
        <div className="vl-pill-row">
          {PAYMENT_METHODS.map((m) => (
            <button type="button" key={m} className={`vl-pill${method === m ? ' selected' : ''}`} onClick={() => setMethod(m)}>{m}</button>
          ))}
        </div>
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Date</label>
        <input type="date" className="vl-input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Notes</label>
        <textarea className="vl-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Sheet>
  )
}
