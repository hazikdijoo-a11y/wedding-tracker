import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, PieChart, Gem, Store, CreditCard, BarChart3, FileText, Settings, Plus } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/budget', label: 'Budget', icon: PieChart },
  { to: '/functions', label: 'Functions', icon: Gem },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ onAddExpense }) {
  return (
    <aside className="vl-sidebar">
      <div className="vl-brand">
        <div className="vl-brand-mark"><Gem size={17} /></div>
        <div>
          <div className="vl-brand-name" style={{ fontFamily: "'Fraunces', serif" }}>Vow &amp; Ledger</div>
          <div className="vl-brand-sub">Wedding budget</div>
        </div>
      </div>
      <button className="vl-btn vl-btn-primary vl-btn-block vl-sidebar-cta" onClick={onAddExpense}>
        <Plus size={16} /> Add Expense
      </button>
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `vl-sidenav-item${isActive ? ' active' : ''}`}
        >
          <item.icon size={17} />
          {item.label}
        </NavLink>
      ))}
      <div className="vl-sidebar-spacer" />
    </aside>
  )
}
