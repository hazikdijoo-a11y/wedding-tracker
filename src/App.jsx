import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useWedding } from './context/WeddingContext'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import { ToastHost } from './components/UI'
import AddExpenseSheet from './modals/AddExpenseSheet'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Functions from './pages/Functions'
import Vendors from './pages/Vendors'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import More from './pages/More'

export default function App() {
  const { loading, wedding, toast, dismissToast } = useWedding()
  const [showAddExpense, setShowAddExpense] = useState(false)

  if (loading) {
    return (
      <div className="vl-skeleton">
        <div className="vl-loader" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <>
        <Onboarding />
        <ToastHost toast={toast} onDismiss={dismissToast} />
      </>
    )
  }

  return (
    <div className="vl-app">
      <Sidebar onAddExpense={() => setShowAddExpense(true)} />
      <div className="vl-main">
        <div className="vl-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/functions" element={<Functions />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/more" element={<More />} />
          </Routes>
        </div>
      </div>
      <BottomNav onAddExpense={() => setShowAddExpense(true)} />
      {showAddExpense ? <AddExpenseSheet onClose={() => setShowAddExpense(false)} /> : null}
      <ToastHost toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
