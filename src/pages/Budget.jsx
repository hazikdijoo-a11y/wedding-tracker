import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Pencil, PieChart, Plus } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { categoryBreakdown, totalPlanned, totalSpent } from '../lib/calc'
import { formatINR } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import { ProgressBar, Sheet, EmptyState } from '../components/UI'

export default function Budget() {
  const { wedding, categories, expenses, addCategory, updateCategory, updateWedding } = useWedding()
  const [editingCat, setEditingCat] = useState(null)
  const [addingCat, setAddingCat] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)

  const breakdown = useMemo(() => categoryBreakdown(categories, expenses), [categories, expenses])
  const planned = totalPlanned(categories)
  const spent = totalSpent(expenses)

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">Budget</h1>
          <div className="vl-page-sub">Planned vs actual across every category</div>
        </div>
        <button className="vl-btn vl-btn-secondary" onClick={() => setEditingBudget(true)}><Pencil size={15} /> Edit Total Budget</button>
      </div>

      <div className="vl-stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="vl-stat">
          <div className="vl-stat-label">Total Budget</div>
          <div className="vl-stat-value">{formatINR(wedding?.totalBudget, { compact: true })}</div>
        </div>
        <div className="vl-stat">
          <div className="vl-stat-label">Total Planned</div>
          <div className="vl-stat-value">{formatINR(planned, { compact: true })}</div>
        </div>
        <div className="vl-stat">
          <div className="vl-stat-label">Total Actual</div>
          <div className="vl-stat-value">{formatINR(spent, { compact: true })}</div>
        </div>
      </div>

      <div className="vl-section-head vl-mt-24">
        <h2 className="vl-section-title">Planned vs Actual</h2>
        <button className="vl-link-btn" onClick={() => setAddingCat(true)}><Plus size={13} /> Add Category</button>
      </div>

      {categories.length === 0 ? (
        <div className="vl-card">
          <EmptyState icon={PieChart} title="No categories yet" text="Add budget categories to start planning your wedding spend." action={<button className="vl-btn vl-btn-primary" onClick={() => setAddingCat(true)}><Plus size={16} /> Add Category</button>} />
        </div>
      ) : (
        <>
          <div className="vl-card vl-table-wrap" style={{ padding: 0 }}>
            <table className="vl-table">
              <thead>
                <tr><th>Category</th><th>Planned</th><th>Actual</th><th>Remaining</th><th></th></tr>
              </thead>
              <tbody>
                {breakdown.map((c) => (
                  <tr key={c.id} onClick={() => setEditingCat(c)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="vl-chip-icon" style={{ width: 30, height: 30 }}><CategoryIcon name={c.icon} size={15} /></span>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td>{formatINR(c.planned)}</td>
                    <td style={{ fontWeight: 700 }}>{formatINR(c.actual)}</td>
                    <td>
                      {c.overBudget ? (
                        <span style={{ color: 'var(--red)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={13} /> {formatINR(Math.abs(c.remaining))} Over
                        </span>
                      ) : c.planned > 0 ? (
                        <span style={{ color: 'var(--green)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} /> {formatINR(c.remaining)}
                        </span>
                      ) : (
                        <span className="vl-faint">—</span>
                      )}
                    </td>
                    <td style={{ width: 120 }}>
                      <ProgressBar pct={c.planned > 0 ? (c.actual / c.planned) * 100 : 0} state={c.overBudget ? 'over' : (c.actual / (c.planned || 1)) >= 0.85 ? 'watch' : 'good'} height={8} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingBudget ? (
        <EditTotalBudgetSheet current={wedding?.totalBudget} onSave={async (v) => { await updateWedding({ totalBudget: v }); setEditingBudget(false) }} onClose={() => setEditingBudget(false)} />
      ) : null}

      {addingCat ? (
        <CategorySheet onSave={async (data) => { await addCategory(data); setAddingCat(false) }} onClose={() => setAddingCat(false)} />
      ) : null}

      {editingCat ? (
        <CategorySheet category={editingCat} onSave={async (data) => { await updateCategory(editingCat.id, data); setEditingCat(null) }} onClose={() => setEditingCat(null)} />
      ) : null}
    </div>
  )
}

function EditTotalBudgetSheet({ current, onSave, onClose }) {
  const [value, setValue] = useState(String(current || ''))
  return (
    <Sheet title="Edit Total Budget" onClose={onClose} footer={<button className="vl-btn vl-btn-primary vl-btn-block" onClick={() => onSave(Number(value) || 0)}>Save</button>}>
      <div className="vl-amount-wrap">
        <span className="vl-amount-symbol">₹</span>
        <input className="vl-amount-input" inputMode="decimal" autoFocus value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))} />
      </div>
    </Sheet>
  )
}

function CategorySheet({ category, onSave, onClose }) {
  const [name, setName] = useState(category?.name || '')
  const [budget, setBudget] = useState(String(category?.budget || ''))
  const isEdit = !!category
  return (
    <Sheet
      title={isEdit ? 'Edit Category' : 'Add Category'}
      onClose={onClose}
      footer={<button className="vl-btn vl-btn-primary vl-btn-block" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), budget: Number(budget) || 0, icon: category?.icon || 'more-horizontal' })}>Save</button>}
    >
      <div className="vl-field">
        <label className="vl-field-label">Category Name</label>
        <input className="vl-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="vl-field">
        <label className="vl-field-label">Budget</label>
        <input className="vl-input" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))} />
      </div>
    </Sheet>
  )
}
