import { useState } from 'react'
import { Sheet } from '../components/UI'
import { useWedding } from '../context/WeddingContext'
import { CategoryIcon } from '../lib/icons'

export default function AddVendorSheet({ onClose, vendor }) {
  const { categories, addVendor, updateVendor } = useWedding()
  const isEdit = !!vendor
  const [name, setName] = useState(vendor?.name || '')
  const [categoryId, setCategoryId] = useState(vendor?.categoryId || '')
  const [phone, setPhone] = useState(vendor?.phone || '')
  const [email, setEmail] = useState(vendor?.email || '')
  const [contractAmount, setContractAmount] = useState(vendor?.contractAmount || '')
  const [notes, setNotes] = useState(vendor?.notes || '')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0

  async function handleSave() {
    if (!canSave || saving) return
    setSaving(true)
    const payload = { name: name.trim(), categoryId: categoryId || null, phone, email, contractAmount: Number(contractAmount) || 0, notes }
    if (isEdit) await updateVendor(vendor.id, payload)
    else await addVendor(payload)
    setSaving(false)
    onClose?.()
  }

  return (
    <Sheet
      title={isEdit ? 'Edit Vendor' : 'Add Vendor'}
      onClose={onClose}
      footer={<button className="vl-btn vl-btn-primary vl-btn-block" disabled={!canSave || saving} onClick={handleSave}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vendor'}</button>}
    >
      <div className="vl-field">
        <label className="vl-field-label">Vendor Name</label>
        <input className="vl-input" placeholder="e.g. Royal Palace Decorators" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Category</label>
        <div className="vl-chip-grid">
          {categories.map((c) => (
            <button type="button" key={c.id} className={`vl-chip${categoryId === c.id ? ' selected' : ''}`} onClick={() => setCategoryId(c.id)}>
              <span className="vl-chip-icon"><CategoryIcon name={c.icon} size={17} /></span>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="vl-field" style={{ flex: 1 }}>
          <label className="vl-field-label">Phone</label>
          <input className="vl-input" placeholder="+91 90000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="vl-field" style={{ flex: 1 }}>
          <label className="vl-field-label">Email</label>
          <input className="vl-input" placeholder="vendor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Contract Amount</label>
        <input className="vl-input" inputMode="decimal" placeholder="₹ 0" value={contractAmount} onChange={(e) => setContractAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Notes</label>
        <textarea className="vl-textarea" placeholder="Optional notes about this vendor…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Sheet>
  )
}
