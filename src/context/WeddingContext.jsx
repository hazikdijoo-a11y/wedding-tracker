import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { db, uid } from '../lib/db'
import { buildDemoData } from '../lib/demoData'
import { expenseStatus, expenseBalance } from '../lib/calc'
import { todayISO } from '../lib/format'

const WeddingContext = createContext(null)

export function WeddingProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [wedding, setWedding] = useState(null)
  const [categories, setCategories] = useState([])
  const [functions, setFunctions] = useState([])
  const [vendors, setVendors] = useState([])
  const [expenses, setExpenses] = useState([])
  const [payments, setPayments] = useState([])
  const [contributions, setContributions] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const w = await db.weddings.toCollection().first()
      if (!mounted) return
      if (w) {
        const [cats, fns, vens, exps, pays, contribs] = await Promise.all([
          db.categories.where('weddingId').equals(w.id).toArray(),
          db.functions.where('weddingId').equals(w.id).toArray(),
          db.vendors.where('weddingId').equals(w.id).toArray(),
          db.expenses.where('weddingId').equals(w.id).toArray(),
          db.payments.where('weddingId').equals(w.id).toArray(),
          db.contributions.where('weddingId').equals(w.id).toArray(),
        ])
        setWedding(w)
        setCategories(cats)
        setFunctions(fns)
        setVendors(vens)
        setExpenses(exps)
        setPayments(pays)
        setContributions(contribs)
      }
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const notify = useCallback((message, kind = 'success') => {
    setToast({ id: uid(), message, kind })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  // ---- setup ----
  const createWedding = useCallback(async (data) => {
    const w = { id: uid(), currency: 'INR', createdAt: new Date().toISOString(), ...data }
    await db.weddings.put(w)
    setWedding(w)
    return w
  }, [])

  const updateWedding = useCallback(async (patch) => {
    setWedding((prev) => {
      const next = { ...prev, ...patch }
      db.weddings.put(next)
      return next
    })
  }, [])

  const loadDemo = useCallback(async () => {
    const data = buildDemoData()
    await Promise.all([
      db.weddings.put(data.wedding),
      db.categories.bulkPut(data.categories),
      db.functions.bulkPut(data.functions),
      db.vendors.bulkPut(data.vendors),
      db.expenses.bulkPut(data.expenses),
      db.payments.bulkPut(data.payments),
      db.contributions.bulkPut(data.contributions),
    ])
    setWedding(data.wedding)
    setCategories(data.categories)
    setFunctions(data.functions)
    setVendors(data.vendors)
    setExpenses(data.expenses)
    setPayments(data.payments)
    setContributions(data.contributions)
  }, [])

  const resetAll = useCallback(async () => {
    await Promise.all([
      db.weddings.clear(), db.categories.clear(), db.functions.clear(),
      db.vendors.clear(), db.expenses.clear(), db.payments.clear(), db.contributions.clear(),
    ])
    setWedding(null); setCategories([]); setFunctions([]); setVendors([])
    setExpenses([]); setPayments([]); setContributions([])
  }, [])

  // ---- categories ----
  const addCategory = useCallback(async (data) => {
    const c = { id: uid(), weddingId: wedding?.id, budget: 0, icon: 'more-horizontal', ...data }
    await db.categories.put(c)
    setCategories((prev) => [...prev, c])
    return c
  }, [wedding])

  const updateCategory = useCallback(async (id, patch) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    const c = await db.categories.get(id)
    await db.categories.put({ ...c, ...patch })
  }, [])

  const deleteCategory = useCallback(async (id) => {
    await db.categories.delete(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ---- functions ----
  const addFunction = useCallback(async (data) => {
    const f = { id: uid(), weddingId: wedding?.id, budget: 0, date: null, ...data }
    await db.functions.put(f)
    setFunctions((prev) => [...prev, f])
    return f
  }, [wedding])

  const updateFunction = useCallback(async (id, patch) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
    const f = await db.functions.get(id)
    await db.functions.put({ ...f, ...patch })
  }, [])

  const deleteFunction = useCallback(async (id) => {
    await db.functions.delete(id)
    setFunctions((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // ---- vendors ----
  const addVendor = useCallback(async (data) => {
    const v = { id: uid(), weddingId: wedding?.id, contractAmount: 0, notes: '', createdAt: new Date().toISOString(), ...data }
    await db.vendors.put(v)
    setVendors((prev) => [...prev, v])
    notify(`Vendor "${v.name}" added`)
    return v
  }, [wedding, notify])

  const updateVendor = useCallback(async (id, patch) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
    const v = await db.vendors.get(id)
    await db.vendors.put({ ...v, ...patch })
  }, [])

  const deleteVendor = useCallback(async (id) => {
    await db.vendors.delete(id)
    setVendors((prev) => prev.filter((v) => v.id !== id))
  }, [])

  // ---- expenses + payments (single ledger, see lib/calc.js) ----
  const addExpense = useCallback(async ({ initialPayment, ...data }) => {
    const id = uid()
    const amount = Number(data.amount) || 0
    const amountPaid = Number(data.amountPaid) || 0
    const expense = {
      id,
      weddingId: wedding?.id,
      categoryId: null,
      functionId: null,
      vendorId: null,
      paymentMethod: 'UPI',
      paidBy: 'Bride',
      expenseDate: todayISO(),
      dueDate: null,
      notes: '',
      receiptDataUrl: null,
      createdAt: new Date().toISOString(),
      ...data,
      amount,
      amountPaid,
    }
    await db.expenses.put(expense)
    setExpenses((prev) => [expense, ...prev])

    if (amountPaid > 0) {
      const payment = {
        id: uid(),
        weddingId: wedding?.id,
        expenseId: id,
        vendorId: expense.vendorId,
        amount: amountPaid,
        paymentDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod,
        label: amountPaid >= amount ? 'Full Payment' : 'Advance',
        notes: '',
        createdAt: new Date().toISOString(),
        ...initialPayment,
      }
      await db.payments.put(payment)
      setPayments((prev) => [payment, ...prev])
    }
    return expense
  }, [wedding])

  const updateExpense = useCallback(async (id, patch) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    const e = await db.expenses.get(id)
    await db.expenses.put({ ...e, ...patch })
  }, [])

  const deleteExpense = useCallback(async (id) => {
    const linkedPayments = await db.payments.where('expenseId').equals(id).toArray()
    await db.expenses.delete(id)
    await db.payments.bulkDelete(linkedPayments.map((p) => p.id))
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    setPayments((prev) => prev.filter((p) => p.expenseId !== id))
  }, [])

  const duplicateExpense = useCallback(async (id, overrides = {}) => {
    const original = expenses.find((e) => e.id === id)
    if (!original) return null
    const copy = {
      ...original,
      id: uid(),
      expenseDate: todayISO(),
      amountPaid: 0,
      dueDate: null,
      createdAt: new Date().toISOString(),
      ...overrides,
    }
    await db.expenses.put(copy)
    setExpenses((prev) => [copy, ...prev])
    return copy
  }, [expenses])

  const addPaymentToExpense = useCallback(async (expenseId, { amount, paymentMethod, paymentDate, label, notes }) => {
    const expense = expenses.find((e) => e.id === expenseId)
    if (!expense) return
    const amt = Number(amount) || 0
    const payment = {
      id: uid(),
      weddingId: wedding?.id,
      expenseId,
      vendorId: expense.vendorId,
      amount: amt,
      paymentDate: paymentDate || todayISO(),
      paymentMethod: paymentMethod || expense.paymentMethod,
      label: label || 'Payment',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    }
    await db.payments.put(payment)
    setPayments((prev) => [payment, ...prev])

    const newPaid = Math.min(expense.amount, (Number(expense.amountPaid) || 0) + amt)
    await updateExpense(expenseId, { amountPaid: newPaid })
    const remaining = Math.max(0, expense.amount - newPaid)
    notify(`Payment Recorded — ₹${amt.toLocaleString('en-IN')} paid. ${remaining > 0 ? `₹${remaining.toLocaleString('en-IN')} remains.` : 'Fully settled.'}`)
    return payment
  }, [expenses, wedding, updateExpense, notify])

  // ---- contributions ----
  const addContribution = useCallback(async (data) => {
    const c = { id: uid(), weddingId: wedding?.id, note: '', createdAt: new Date().toISOString(), ...data }
    await db.contributions.put(c)
    setContributions((prev) => [c, ...prev])
    return c
  }, [wedding])

  const deleteContribution = useCallback(async (id) => {
    await db.contributions.delete(id)
    setContributions((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ---- smart suggestions: most recent category -> function/vendor combo ----
  const suggestForCategory = useCallback((categoryId) => {
    const matches = expenses
      .filter((e) => e.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (!matches.length) return null
    const counts = new Map()
    for (const m of matches) {
      const key = `${m.functionId || ''}|${m.vendorId || ''}`
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    const [topKey] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    const [functionId, vendorId] = topKey.split('|')
    return { functionId: functionId || null, vendorId: vendorId || null }
  }, [expenses])

  const value = useMemo(() => ({
    loading, wedding, categories, functions, vendors, expenses, payments, contributions,
    toast, notify, dismissToast,
    createWedding, updateWedding, loadDemo, resetAll,
    addCategory, updateCategory, deleteCategory,
    addFunction, updateFunction, deleteFunction,
    addVendor, updateVendor, deleteVendor,
    addExpense, updateExpense, deleteExpense, duplicateExpense, addPaymentToExpense,
    addContribution, deleteContribution,
    suggestForCategory,
  }), [
    loading, wedding, categories, functions, vendors, expenses, payments, contributions, toast,
    notify, dismissToast, createWedding, updateWedding, loadDemo, resetAll,
    addCategory, updateCategory, deleteCategory, addFunction, updateFunction, deleteFunction,
    addVendor, updateVendor, deleteVendor, addExpense, updateExpense, deleteExpense,
    duplicateExpense, addPaymentToExpense, addContribution, deleteContribution, suggestForCategory,
  ])

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
}

export function useWedding() {
  const ctx = useContext(WeddingContext)
  if (!ctx) throw new Error('useWedding must be used within WeddingProvider')
  return ctx
}

export { expenseStatus, expenseBalance }
