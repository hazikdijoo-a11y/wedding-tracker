import { Link } from 'react-router-dom'
import { PieChart, Gem, CreditCard, BarChart3, Settings, ChevronRight, Store } from 'lucide-react'

const ITEMS = [
  { to: '/budget', label: 'Budget', icon: PieChart, desc: 'Planned vs actual by category' },
  { to: '/functions', label: 'Functions', icon: Gem, desc: 'Spend by wedding event' },
  { to: '/vendors', label: 'Vendors', icon: Store, desc: 'Contracts and payment history' },
  { to: '/payments', label: 'Payments', icon: CreditCard, desc: 'Due dates and payment log' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, desc: 'Charts and insights' },
  { to: '/settings', label: 'Settings', icon: Settings, desc: 'Wedding details and data' },
]

export default function More() {
  return (
    <div>
      <div className="vl-page-head"><h1 className="vl-page-title">More</h1></div>
      <div className="vl-card vl-card-flush">
        {ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="vl-expense-row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="vl-expense-icon"><item.icon size={19} /></div>
            <div className="vl-expense-main">
              <div className="vl-expense-title">{item.label}</div>
              <div className="vl-expense-meta">{item.desc}</div>
            </div>
            <ChevronRight size={16} className="vl-faint" />
          </Link>
        ))}
      </div>
    </div>
  )
}
