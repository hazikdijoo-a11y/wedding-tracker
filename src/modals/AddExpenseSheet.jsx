import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, CheckCircle2, Paperclip, Plus, Sparkles, X } from 'lucide-react'
import { Sheet } from '../components/UI'
import { CategoryIcon } from '../lib/icons'
import { useWedding } from '../context/WeddingContext'
import { PAYMENT_METHODS, PAID_BY_OPTIONS } from '../lib/db'
import { todayISO, formatINR } from '../lib/format'

const STATUS_OPTIONS = ['Paid', 'Partial', 'Pending']

export default function AddExpenseSheet({ onClose, defaults = {} }) {
  const { categories, functions, vendors, addExpense, addVendor, suggestForCategory } = useWedding()

  const [amount, setAmount] = useState(defaults.amount || '')
  const [categoryId, setCategoryId] = useState(defaults.categoryId || '')
  const [functionId, setFunctionId] = useState(defaults.functionId || '')
  const [vendorId, setVendorId] = useState(defaults.vendorId || '')
  const [status, setStatus] = useState(defaults.status || 'Paid')
  const [amountPaidSoFar, setAmountPaidSoFar] = useState('')
  const [method, setMethod] = useState('UPI')
  const [paidBy, setPaidBy] = useState('Bride')
  const [date, setDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState(defaults.notes || '')
  const [receiptDataUrl, setReceiptDataUrl] = useState(null)
  const [receiptName, setReceiptName] = useState('')
  const [showNewVendor, setShowNewVendor] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const amountRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => { amountRef.current?.focus() }, [])

  useEffect(() => {
    if (!categoryId || defaults.categoryId) return
    const s = suggestForCategory(categoryId)
    if (s && (s.functionId || s.vendorId) && !functionId && !vendorId) {
      setSuggestion(s)
    } else {
      setSuggestion(null)
    }
  }, [categoryId]) // eslint-disable-line react-hooks/exhaustive-deps

  const applySuggestion = () => {
    if (!suggestion) return
    if (suggestion.functionId) setFunctionId(suggestion.functionId)
    if (suggestion.vendorId) setVendorId(suggestion.vendorId)
    setSuggestion(null)
  }

  const filteredVendors = useMemo(
    () => (categoryId ? vendors.filter((v) => v.categoryId === categoryId) : vendors),
    [vendors, categoryId]
  )

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const numAmount = Number(amount) || 0
  const canSave = numAmount > 0 && categoryId && functionId

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptName(file.name)
    const reader = new FileReader()
    reader.onload = () => setReceiptDataUrl(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleCreateVendor() {
    if (!newVendorName.trim()) return
    const v = await addVendor({ name: newVendorName.trim(), categoryId: categoryId || null, phone: '', email: '', contractAmount: 0 })
    setVendorId(v.id)
    setShowNewVendor(false)
    setNewVendorName('')
  }

  async function handleSave() {
    if (!canSave || saving) return
    setSaving(true)
    const amountPaid = status === 'Paid' ? numAmount : status === 'Partial' ? Math.min(numAmount, Number(amountPaidSoFar) || 0) : 0
    await addExpense({
      amount: numAmount,
      amountPaid,
      categoryId,
      functionId,
      vendorId: vendorId || null,
      paymentMethod: method,
      paidBy,
      expenseDate: date,
      dueDate: status !== 'Paid' ? (dueDate || null) : null,
      notes,
      receiptDataUrl,
    })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => onClose?.(), 900)
  }

  if (success) {
    return (
      <Sheet title="" onClose={onClose}>
        <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
          <div className="vl-success-check"><CheckCircle2 size={36} /></div>
          <h3 style={{ fontSize: 21, marginBottom: 6 }}>Expense Added ✓</h3>
          <p className="vl-muted" style={{ fontSize: 14 }}>
            {formatINR(numAmount)} logged for {selectedCategory?.name || 'this category'}. Dashboard updated.
          </p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      title="Add Expense"
      onClose={onClose}
      footer={
        <button className="vl-btn vl-btn-primary vl-btn-block" disabled={!canSave || saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Expense'}
        </button>
      }
    >
      <div className="vl-amount-wrap">
        <span className="vl-amount-symbol">₹</span>
        <input
          ref={amountRef}
          className="vl-amount-input"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
        />
      </div>

      <div className="vl-field">
        <label className="vl-field-label">Category</label>
        <div className="vl-chip-grid">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`vl-chip${categoryId === c.id ? ' selected' : ''}`}
              onClick={() => { setCategoryId(c.id); if (vendorId) { const v = vendors.find(x => x.id === vendorId); if (v && v.categoryId && v.categoryId !== c.id) setVendorId('') } }}
            >
              <span className="vl-chip-icon"><CategoryIcon name={c.icon} size={17} /></span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {suggestion ? (
        <div className="vl-suggestion-banner">
          <Sparkles size={15} />
          <span>Usually paired with {suggestion.functionId ? functions.find(f => f.id === suggestion.functionId)?.name : ''}{suggestion.vendorId ? ` · ${vendors.find(v => v.id === suggestion.vendorId)?.name}` : ''}</span>
          <button className="vl-link-btn" onClick={applySuggestion}>Use</button>
        </div>
      ) : null}

      <div className="vl-field">
        <label className="vl-field-label">Event / Function</label>
        <div className="vl-pill-row">
          {functions.map((f) => (
            <button type="button" key={f.id} className={`vl-pill${functionId === f.id ? ' selected' : ''}`} onClick={() => setFunctionId(f.id)}>
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="vl-field">
        <label className="vl-field-label">Vendor</label>
        {!showNewVendor ? (
          <div className="vl-pill-row">
            {filteredVendors.map((v) => (
              <button type="button" key={v.id} className={`vl-pill${vendorId === v.id ? ' selected' : ''}`} onClick={() => setVendorId(v.id)}>
                {v.name}
              </button>
            ))}
            <button type="button" className="vl-pill" onClick={() => setShowNewVendor(true)}>
              <Plus size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Add Vendor
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="vl-input" placeholder="Vendor name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} autoFocus />
            <button className="vl-btn vl-btn-primary vl-btn-sm" onClick={handleCreateVendor}>Add</button>
            <button className="vl-iconbtn" onClick={() => setShowNewVendor(false)}><X size={16} /></button>
          </div>
        )}
      </div>

      <div className="vl-field">
        <label className="vl-field-label">Payment Status</label>
        <div className="vl-pill-row">
          {STATUS_OPTIONS.map((s) => (
            <button
              type="button"
              key={s}
              className={`vl-pill status-${s.toLowerCase()}${status === s ? ' selected' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {status === 'Partial' ? (
        <div className="vl-field">
          <label className="vl-field-label">Amount Paid So Far</label>
          <input className="vl-input" inputMode="decimal" placeholder="₹ 0" value={amountPaidSoFar} onChange={(e) => setAmountPaidSoFar(e.target.value.replace(/[^0-9.]/g, ''))} />
        </div>
      ) : null}

      <div className="vl-field">
        <label className="vl-field-label">Payment Method</label>
        <div className="vl-pill-row">
          {PAYMENT_METHODS.map((m) => (
            <button type="button" key={m} className={`vl-pill${method === m ? ' selected' : ''}`} onClick={() => setMethod(m)}>{m}</button>
          ))}
        </div>
      </div>

      <div className="vl-field">
        <label className="vl-field-label">Paid By</label>
        <div className="vl-pill-row">
          {PAID_BY_OPTIONS.map((p) => (
            <button type="button" key={p} className={`vl-pill${paidBy === p ? ' selected' : ''}`} onClick={() => setPaidBy(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div className="vl-field" style={{ flex: 1 }}>
          <label className="vl-field-label">Date</label>
          <input type="date" className="vl-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {status !== 'Paid' ? (
          <div className="vl-field" style={{ flex: 1 }}>
            <label className="vl-field-label">Due Date</label>
            <input type="date" className="vl-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        ) : null}
      </div>

      <div className="vl-field">
        <label className="vl-field-label">Notes (optional)</label>
        <textarea className="vl-textarea" placeholder="Add a quick note…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="vl-field">
        <label className="vl-field-label">Receipt (optional)</label>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
        {receiptDataUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {receiptDataUrl.startsWith('data:image') ? (
              <img src={receiptDataUrl} alt="Receipt" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10 }} />
            ) : (
              <div className="vl-expense-icon"><Paperclip size={18} /></div>
            )}
            <span className="vl-muted" style={{ fontSize: 13 }}>{receiptName}</span>
            <button className="vl-iconbtn" onClick={() => { setReceiptDataUrl(null); setReceiptName('') }}><X size={15} /></button>
          </div>
        ) : (
          <button type="button" className="vl-btn vl-btn-secondary" onClick={() => fileRef.current?.click()}>
            <Camera size={16} /> Add Receipt
          </button>
        )}
      </div>
    </Sheet>
  )
}
