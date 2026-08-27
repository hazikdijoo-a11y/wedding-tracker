import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, Store, FileText, Menu, Plus } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/more', label: 'More', icon: Menu },
]

export default function BottomNav({ onAddExpense }) {
  return (
    <>
      <button className="vl-fab" onClick={onAddExpense} aria-label="Add Expense">
        <Plus size={26} />
      </button>
      <nav className="vl-bottomnav">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `vl-navitem${isActive ? ' active' : ''}`}>
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
