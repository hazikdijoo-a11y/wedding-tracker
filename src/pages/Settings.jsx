import { useRef, useState } from 'react'
import { Download, Upload, Sparkles, Trash2, Plus, X } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { db, CONTRIBUTION_SOURCES } from '../lib/db'
import { ConfirmDialog } from '../components/UI'
import { formatINR } from '../lib/format'

export default function Settings() {
  const { wedding, updateWedding, loadDemo, resetAll, notify, contributions, addContribution, deleteContribution } = useWedding()
  const [contribSource, setContribSource] = useState(CONTRIBUTION_SOURCES[0])
  const [contribAmount, setContribAmount] = useState('')
  const [form, setForm] = useState({
    weddingName: wedding?.weddingName || '',
    brideName: wedding?.brideName || '',
    groomName: wedding?.groomName || '',
    weddingDate: wedding?.weddingDate || '',
    city: wedding?.city || '',
    totalBudget: String(wedding?.totalBudget || ''),
  })
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef(null)

  async function save() {
    await updateWedding({
      ...form,
      totalBudget: Number(form.totalBudget) || 0,
    })
    notify('Wedding details saved')
  }

  async function exportBackup() {
    const data = {
      wedding,
      categories: await db.categories.toArray(),
      functions: await db.functions.toArray(),
      vendors: await db.vendors.toArray(),
      expenses: await db.expenses.toArray(),
      payments: await db.payments.toArray(),
      contributions: await db.contributions.toArray(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(wedding?.weddingName || 'wedding').replace(/\s+/g, '-')}-backup.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function importBackup(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        await db.weddings.put(data.wedding)
        await db.categories.bulkPut(data.categories || [])
        await db.functions.bulkPut(data.functions || [])
        await db.vendors.bulkPut(data.vendors || [])
        await db.expenses.bulkPut(data.expenses || [])
        await db.payments.bulkPut(data.payments || [])
        await db.contributions.bulkPut(data.contributions || [])
        window.location.reload()
      } catch {
        notify('That file could not be read as a backup', 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <div className="vl-page-head"><h1 className="vl-page-title">Settings</h1></div>

      <div className="vl-card">
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Wedding Details</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Bride's Name" value={form.brideName} onChange={(v) => setForm((f) => ({ ...f, brideName: v }))} />
          <Field label="Groom's Name" value={form.groomName} onChange={(v) => setForm((f) => ({ ...f, groomName: v }))} />
        </div>
        <Field label="Wedding Name" value={form.weddingName} onChange={(v) => setForm((f) => ({ ...f, weddingName: v }))} />
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Wedding Date" type="date" value={form.weddingDate} onChange={(v) => setForm((f) => ({ ...f, weddingDate: v }))} />
          <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
        </div>
        <Field label="Total Budget (₹)" value={form.totalBudget} onChange={(v) => setForm((f) => ({ ...f, totalBudget: v.replace(/[^0-9.]/g, '') }))} />
        <button className="vl-btn vl-btn-primary" onClick={save}>Save Changes</button>
      </div>

      <div className="vl-card vl-mt-16">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Contributions</h3>
        <p className="vl-muted" style={{ fontSize: 13.5, marginBottom: 14 }}>Track who's funding the wedding — bride, groom, families or other sources.</p>
        {contributions.length > 0 ? (
          <div className="vl-legend" style={{ marginBottom: 16 }}>
            {contributions.map((c) => (
              <div key={c.id} className="vl-flex-between" style={{ fontSize: 13.5, padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.source}</div>
                  {c.note ? <div className="vl-faint" style={{ fontSize: 11.5 }}>{c.note}</div> : null}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700 }}>{formatINR(c.amount)}</span>
                  <button className="vl-iconbtn" style={{ width: 28, height: 28 }} onClick={() => deleteContribution(c.id)}><X size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="vl-select" style={{ flex: 1, minWidth: 140 }} value={contribSource} onChange={(e) => setContribSource(e.target.value)}>
            {CONTRIBUTION_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="vl-input" style={{ flex: 1, minWidth: 100 }} inputMode="decimal" placeholder="₹ Amount" value={contribAmount} onChange={(e) => setContribAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
          <button
            className="vl-btn vl-btn-primary"
            disabled={!contribAmount}
            onClick={async () => { await addContribution({ source: contribSource, amount: Number(contribAmount) || 0 }); setContribAmount('') }}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      <div className="vl-card vl-mt-16">
        <h3 style={{ fontSize: 16, marginBottom: 4 }}>Currency</h3>
        <p className="vl-muted" style={{ fontSize: 13.5 }}>All amounts are shown in Indian Rupees (₹) with Indian digit grouping.</p>
      </div>

      <div className="vl-card vl-mt-16">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Data</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="vl-btn vl-btn-secondary" onClick={exportBackup}><Download size={15} /> Export Backup</button>
          <button className="vl-btn vl-btn-secondary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Import Backup</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={importBackup} />
          <button className="vl-btn vl-btn-secondary" onClick={loadDemo}><Sparkles size={15} /> Load Demo Data</button>
        </div>
      </div>

      <div className="vl-card vl-mt-16" style={{ borderColor: 'var(--red-soft)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 4, color: 'var(--red)' }}>Danger Zone</h3>
        <p className="vl-muted" style={{ fontSize: 13.5, marginBottom: 14 }}>Permanently delete this wedding and all its data from this device.</p>
        <button className="vl-btn vl-btn-danger" onClick={() => setConfirmReset(true)}><Trash2 size={15} /> Delete Wedding Data</button>
      </div>

      {confirmReset ? (
        <ConfirmDialog
          title="Delete All Wedding Data?"
          message="This permanently removes your wedding, budget, expenses, vendors and payments from this device. This cannot be undone."
          confirmLabel="Delete Everything"
          danger
          onConfirm={async () => { await resetAll(); setConfirmReset(false) }}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="vl-field" style={{ flex: 1 }}>
      <label className="vl-field-label">{label}</label>
      <input type={type} className="vl-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
