import { useMemo, useState } from 'react'
import { Store, Plus, Search } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { vendorTotals } from '../lib/calc'
import { formatINR } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import { EmptyState, ProgressBar } from '../components/UI'
import AddVendorSheet from '../modals/AddVendorSheet'
import VendorDetailSheet from '../modals/VendorDetailSheet'

export default function Vendors() {
  const { vendors, categories, expenses } = useWedding()
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const selected = vendors.find((v) => v.id === selectedId) || null
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return vendors
    const q = query.toLowerCase()
    return vendors.filter((v) => v.name.toLowerCase().includes(q))
  }, [vendors, query])

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">Vendors</h1>
          <div className="vl-page-sub">{vendors.length} vendors on your wedding team</div>
        </div>
        <button className="vl-btn vl-btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add Vendor</button>
      </div>

      {vendors.length > 0 ? (
        <div className="vl-search">
          <Search size={17} color="var(--charcoal-faint)" />
          <input placeholder="Search vendors…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      ) : null}

      {vendors.length === 0 ? (
        <div className="vl-card">
          <EmptyState icon={Store} title="No vendors yet" text="Add your first vendor to start tracking payments." action={<button className="vl-btn vl-btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add Vendor</button>} />
        </div>
      ) : (
        <div className="vl-grid-cards">
          {filtered.map((v) => {
            const cat = categories.find((c) => c.id === v.categoryId)
            const totals = vendorTotals(v, expenses)
            const pct = totals.contract > 0 ? Math.min(100, Math.round((totals.paid / totals.contract) * 100)) : 0
            return (
              <div key={v.id} className="vl-card vl-vendor-card" onClick={() => setSelectedId(v.id)}>
                <div className="vl-vendor-top">
                  <div className="vl-vendor-avatar">{v.name.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                    <div className="vl-muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {cat ? <CategoryIcon name={cat.icon} size={12} /> : null} {cat?.name || 'Uncategorized'}
                    </div>
                  </div>
                </div>
                {totals.contract > 0 ? (
                  <>
                    <ProgressBar pct={pct} state={totals.balance > 0 ? 'watch' : 'good'} height={8} />
                    <div className="vl-flex-between">
                      <span className="vl-faint" style={{ fontSize: 12 }}>Paid {formatINR(totals.paid, { compact: true })}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: totals.balance > 0 ? 'var(--red)' : 'var(--green)' }}>
                        {totals.balance > 0 ? `${formatINR(totals.balance, { compact: true })} due` : 'Settled'}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="vl-faint" style={{ fontSize: 12.5 }}>No contract amount set</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {adding ? <AddVendorSheet onClose={() => setAdding(false)} /> : null}
      {selected ? <VendorDetailSheet vendor={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  )
}
