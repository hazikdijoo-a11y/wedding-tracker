import { useMemo, useState } from 'react'
import { Gem, Plus } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { functionBreakdown } from '../lib/calc'
import { formatINR, formatDate } from '../lib/format'
import { ProgressBar, Sheet, EmptyState } from '../components/UI'

export default function Functions() {
  const { functions, expenses, addFunction, updateFunction } = useWedding()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const breakdown = useMemo(() => functionBreakdown(functions, expenses), [functions, expenses])

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">Wedding Functions</h1>
          <div className="vl-page-sub">Budget and spend for every event</div>
        </div>
        <button className="vl-btn vl-btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add Function</button>
      </div>

      {breakdown.length === 0 ? (
        <div className="vl-card">
          <EmptyState icon={Gem} title="No functions yet" text="Add your wedding events — Haldi, Sangeet, Reception — to track spend by occasion." action={<button className="vl-btn vl-btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add Function</button>} />
        </div>
      ) : (
        <div className="vl-grid-cards">
          {breakdown.map((f) => (
            <div key={f.id} className="vl-card" onClick={() => setEditing(f)} style={{ cursor: 'pointer' }}>
              <div className="vl-flex-between" style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 17 }}>{f.name}</h3>
                {f.date ? <span className="vl-faint" style={{ fontSize: 12 }}>{formatDate(f.date)}</span> : null}
              </div>
              <ProgressBar pct={f.pct} state={f.overBudget ? 'over' : f.pct >= 85 ? 'watch' : 'good'} />
              <div className="vl-flex-between vl-mt-8">
                <div>
                  <div className="vl-faint" style={{ fontSize: 11.5 }}>BUDGET</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{formatINR(f.budget)}</div>
                </div>
                <div>
                  <div className="vl-faint" style={{ fontSize: 11.5, textAlign: 'center' }}>SPENT</div>
                  <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{formatINR(f.spent)}</div>
                </div>
                <div>
                  <div className="vl-faint" style={{ fontSize: 11.5, textAlign: 'right' }}>REMAINING</div>
                  <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'right', color: f.overBudget ? 'var(--red)' : 'var(--green)' }}>
                    {formatINR(f.remaining)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding ? <FunctionSheet onSave={async (data) => { await addFunction(data); setAdding(false) }} onClose={() => setAdding(false)} /> : null}
      {editing ? <FunctionSheet fn={editing} onSave={async (data) => { await updateFunction(editing.id, data); setEditing(null) }} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function FunctionSheet({ fn, onSave, onClose }) {
  const [name, setName] = useState(fn?.name || '')
  const [budget, setBudget] = useState(String(fn?.budget || ''))
  const [date, setDate] = useState(fn?.date || '')
  const isEdit = !!fn
  return (
    <Sheet
      title={isEdit ? 'Edit Function' : 'Add Function'}
      onClose={onClose}
      footer={<button className="vl-btn vl-btn-primary vl-btn-block" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), budget: Number(budget) || 0, date: date || null })}>Save</button>}
    >
      <div className="vl-field">
        <label className="vl-field-label">Function Name</label>
        <input className="vl-input" placeholder="e.g. Cocktail Night" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Budget</label>
        <input className="vl-input" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))} />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Date (optional)</label>
        <input type="date" className="vl-input" value={date || ''} onChange={(e) => setDate(e.target.value)} />
      </div>
    </Sheet>
  )
}
