import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, BarChart, Bar,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useWedding } from '../context/WeddingContext'
import { categoryBreakdown, contributionTotals, timelineSeries, totalSpent } from '../lib/calc'
import { formatINR } from '../lib/format'
import { CategoryIcon } from '../lib/icons'
import { EmptyState } from '../components/UI'
import { BarChart3 } from 'lucide-react'

const PALETTE = ['#B4863A', '#D98C8C', '#3F7A5D', '#8F6B2C', '#B8791E', '#766E62', '#C9A15A', '#A8686F', '#5E8F72', '#9C7A47', '#C4785E', '#6B7A99']

export default function Analytics() {
  const { categories, expenses, contributions } = useWedding()
  const navigate = useNavigate()
  const [granularity, setGranularity] = useState('weekly')

  const breakdown = useMemo(() => categoryBreakdown(categories, expenses).filter((c) => c.actual > 0), [categories, expenses])
  const spent = totalSpent(expenses)
  const timeline = useMemo(() => timelineSeries(expenses, granularity), [expenses, granularity])
  const contribTotals = useMemo(() => contributionTotals(contributions), [contributions])
  const contribData = useMemo(() => [...contribTotals.entries()].map(([source, amount]) => ({ source, amount })), [contribTotals])

  if (expenses.length === 0) {
    return (
      <div>
        <div className="vl-page-head"><h1 className="vl-page-title">Analytics</h1></div>
        <div className="vl-card"><EmptyState icon={BarChart3} title="Nothing to analyze yet" text="Add a few expenses and your spending story will appear here." /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="vl-page-head">
        <div>
          <h1 className="vl-page-title">Analytics</h1>
          <div className="vl-page-sub">A visual read on where your wedding money is going</div>
        </div>
      </div>

      <div className="vl-grid-2">
        <div className="vl-card">
          <div className="vl-section-head"><h2 className="vl-section-title">Where Is The Money Going?</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={breakdown} dataKey="actual" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} strokeWidth={0}>
                  {breakdown.map((entry, i) => <Cell key={entry.id} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid var(--line)', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="vl-legend" style={{ width: '100%' }}>
              {breakdown.map((c, i) => (
                <div key={c.id} className="vl-legend-row" onClick={() => navigate(`/expenses?category=${c.id}`)}>
                  <span className="vl-legend-swatch" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="vl-chip-icon" style={{ width: 26, height: 26 }}><CategoryIcon name={c.icon} size={13} /></span>
                  <span className="vl-legend-name">{c.name}</span>
                  <span className="vl-legend-pct">{Math.round((c.actual / spent) * 100)}%</span>
                  <span style={{ fontWeight: 700, fontSize: 13, width: 84, textAlign: 'right' }}>{formatINR(c.actual, { compact: true })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="vl-card">
          <div className="vl-section-head">
            <h2 className="vl-section-title">Wedding Spending Over Time</h2>
          </div>
          <div className="vl-pill-row" style={{ marginBottom: 14 }}>
            {['daily', 'weekly', 'monthly'].map((g) => (
              <button key={g} className={`vl-pill${granularity === g ? ' selected' : ''}`} onClick={() => setGranularity(g)} style={{ textTransform: 'capitalize' }}>{g}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="vlSpendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
              <XAxis dataKey="key" tick={{ fontSize: 11, fill: 'var(--charcoal-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={{ fontSize: 11, fill: 'var(--charcoal-faint)' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid var(--line)', fontSize: 13 }} />
              <Area type="monotone" dataKey="cumulative" stroke="var(--gold-deep)" strokeWidth={2.5} fill="url(#vlSpendGrad)" name="Total Spent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="vl-card vl-mt-16">
        <div className="vl-section-head"><h2 className="vl-section-title">Who's Contributing?</h2></div>
        {contribData.length === 0 ? (
          <p className="vl-muted" style={{ fontSize: 13.5 }}>Add contributions in Settings to see the funding breakdown.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contribData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatINR(v, { compact: true })} tick={{ fontSize: 11, fill: 'var(--charcoal-faint)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="source" width={110} tick={{ fontSize: 12, fill: 'var(--charcoal)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid var(--line)', fontSize: 13 }} />
              <Bar dataKey="amount" fill="var(--gold)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
