import { uid, DEFAULT_CATEGORIES, DEFAULT_FUNCTIONS } from './db'

// Realistic demo dataset — Aisha & Rahul's Wedding — so the dashboard looks
// impressive the first time it's opened, per the product brief.
export function buildDemoData() {
  const weddingId = uid()
  const now = new Date()
  const iso = (daysAgo) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().slice(0, 10)
  }

  const wedding = {
    id: weddingId,
    weddingName: "Aisha & Rahul's Wedding",
    brideName: 'Aisha',
    groomName: 'Rahul',
    weddingDate: '2026-12-18',
    city: 'Jaipur',
    totalBudget: 2500000,
    currency: 'INR',
    createdAt: iso(60),
  }

  const catBudgets = {
    Venue: 500000,
    Catering: 600000,
    Decoration: 300000,
    Photography: 220000,
    Videography: 120000,
    Makeup: 90000,
    Jewellery: 300000,
    Clothing: 250000,
    Invitations: 40000,
    Entertainment: 100000,
    Transportation: 80000,
    Accommodation: 120000,
    Gifts: 60000,
    'Priest / Ceremony': 30000,
    'Music / DJ': 70000,
  }

  const categories = DEFAULT_CATEGORIES.map((c) => ({
    id: uid(),
    weddingId,
    name: c.name,
    icon: c.icon,
    budget: catBudgets[c.name] ?? 30000,
  }))
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]))

  const funcBudgets = {
    Engagement: 200000,
    Haldi: 150000,
    Mehendi: 200000,
    Sangeet: 400000,
    Wedding: 1000000,
    Reception: 500000,
    'Post-Wedding': 20000,
    General: 30000,
  }
  const functions = DEFAULT_FUNCTIONS.map((name, i) => ({
    id: uid(),
    weddingId,
    name,
    budget: funcBudgets[name] ?? 0,
    date: i < 6 ? iso(-((6 - i) * 15)) : null,
  }))
  const funcByName = Object.fromEntries(functions.map((f) => [f.name, f]))

  const vendorDefs = [
    { name: 'Royal Palace Decorators', category: 'Decoration', contract: 300000, phone: '+91 98200 11223', email: 'hello@royalpalacedecor.in' },
    { name: 'The Grand Vista Venue', category: 'Venue', contract: 500000, phone: '+91 98100 55667', email: 'events@grandvista.in' },
    { name: 'Saffron Trail Caterers', category: 'Catering', contract: 620000, phone: '+91 99870 44556', email: 'bookings@saffrontrail.in' },
    { name: 'Lens & Light Studios', category: 'Photography', contract: 220000, phone: '+91 97650 33221', email: 'studio@lenslight.in' },
    { name: 'Frame Story Films', category: 'Videography', contract: 120000, phone: '+91 96540 88990', email: 'contact@framestory.in' },
    { name: 'Glow Makeovers by Neha', category: 'Makeup', contract: 90000, phone: '+91 98765 12340', email: 'neha@glowmakeovers.in' },
    { name: 'Kundan Heritage Jewellers', category: 'Jewellery', contract: 310000, phone: '+91 98230 77889', email: 'sales@kundanheritage.in' },
    { name: 'Vastra Couture House', category: 'Clothing', contract: 260000, phone: '+91 90040 66778', email: 'orders@vastracouture.in' },
    { name: 'Regal Invites & Co', category: 'Invitations', contract: 40000, phone: '+91 91234 55990', email: 'print@regalinvites.in' },
    { name: 'Beats & Baraat Entertainment', category: 'Entertainment', contract: 100000, phone: '+91 92345 66112', email: 'book@beatsbaraat.in' },
  ]
  const vendors = vendorDefs.map((v) => ({
    id: uid(),
    weddingId,
    name: v.name,
    categoryId: catByName[v.category]?.id || null,
    phone: v.phone,
    email: v.email,
    contractAmount: v.contract,
    notes: '',
    createdAt: iso(45),
  }))
  const vendorByName = Object.fromEntries(vendors.map((v) => [v.name, v]))

  const expenses = []
  const payments = []

  function addExpense({ category, fn, vendor, amount, status, method, paidBy, daysAgo, notes, dueInDays }) {
    const cat = catByName[category]
    const func = funcByName[fn]
    const ven = vendor ? vendorByName[vendor] : null
    const amountPaid = status === 'Paid' ? amount : status === 'Partial' ? Math.round(amount * 0.5) : 0
    const id = uid()
    const expenseDate = iso(daysAgo)
    const expense = {
      id,
      weddingId,
      categoryId: cat.id,
      functionId: func.id,
      vendorId: ven?.id || null,
      amount,
      amountPaid,
      paymentMethod: method,
      paidBy,
      expenseDate,
      dueDate: status !== 'Paid' && dueInDays != null ? iso(-dueInDays) : null,
      notes: notes || '',
      receiptDataUrl: null,
      createdAt: expenseDate,
    }
    expenses.push(expense)
    if (amountPaid > 0) {
      payments.push({
        id: uid(),
        weddingId,
        expenseId: id,
        vendorId: ven?.id || null,
        amount: amountPaid,
        paymentDate: expenseDate,
        paymentMethod: method,
        label: status === 'Paid' ? 'Full Payment' : 'Advance',
        notes: '',
        createdAt: expenseDate,
      })
    }
    return expense
  }

  addExpense({ category: 'Venue', fn: 'Wedding', vendor: 'The Grand Vista Venue', amount: 250000, status: 'Paid', method: 'Bank Transfer', paidBy: "Groom's Family", daysAgo: 40, notes: 'Advance booking for venue hall.' })
  addExpense({ category: 'Venue', fn: 'Wedding', vendor: 'The Grand Vista Venue', amount: 210000, status: 'Partial', method: 'Bank Transfer', paidBy: "Groom's Family", daysAgo: 10, dueInDays: -12, notes: 'Second installment before the event.' })
  addExpense({ category: 'Catering', fn: 'Wedding', vendor: 'Saffron Trail Caterers', amount: 400000, status: 'Partial', method: 'UPI', paidBy: "Bride's Family", daysAgo: 20, dueInDays: -5, notes: 'Per-plate rate for 500 guests, wedding night.' })
  addExpense({ category: 'Catering', fn: 'Reception', vendor: 'Saffron Trail Caterers', amount: 220000, status: 'Pending', method: 'UPI', paidBy: "Bride's Family", daysAgo: 5, dueInDays: -3, notes: 'Reception dinner menu.' })
  addExpense({ category: 'Decoration', fn: 'Wedding', vendor: 'Royal Palace Decorators', amount: 150000, status: 'Paid', method: 'UPI', paidBy: 'Groom', daysAgo: 25, notes: 'Includes stage decoration, flowers and entrance.' })
  addExpense({ category: 'Decoration', fn: 'Sangeet', vendor: 'Royal Palace Decorators', amount: 60000, status: 'Paid', method: 'UPI', paidBy: 'Groom', daysAgo: 18 })
  addExpense({ category: 'Photography', fn: 'Wedding', vendor: 'Lens & Light Studios', amount: 220000, status: 'Partial', method: 'Bank Transfer', paidBy: 'Bride', daysAgo: 15, dueInDays: -1, notes: 'Full-day coverage + album.' })
  addExpense({ category: 'Videography', fn: 'Wedding', vendor: 'Frame Story Films', amount: 120000, status: 'Partial', method: 'Bank Transfer', paidBy: 'Bride', daysAgo: 15, dueInDays: 2 })
  addExpense({ category: 'Makeup', fn: 'Wedding', vendor: 'Glow Makeovers by Neha', amount: 55000, status: 'Paid', method: 'UPI', paidBy: 'Bride', daysAgo: 8, notes: 'Bridal makeup + trial session.' })
  addExpense({ category: 'Makeup', fn: 'Sangeet', vendor: 'Glow Makeovers by Neha', amount: 20000, status: 'Paid', method: 'Cash', paidBy: 'Bride', daysAgo: 8 })
  addExpense({ category: 'Jewellery', fn: 'Wedding', vendor: 'Kundan Heritage Jewellers', amount: 285000, status: 'Partial', method: 'Bank Transfer', paidBy: "Bride's Family", daysAgo: 30, dueInDays: 5, notes: 'Bridal set — kundan choker and earrings.' })
  addExpense({ category: 'Clothing', fn: 'Wedding', vendor: 'Vastra Couture House', amount: 180000, status: 'Paid', method: 'Credit Card', paidBy: 'Bride', daysAgo: 22, notes: 'Bridal lehenga.' })
  addExpense({ category: 'Clothing', fn: 'Sangeet', vendor: 'Vastra Couture House', amount: 65000, status: 'Paid', method: 'Credit Card', paidBy: 'Groom', daysAgo: 22 })
  addExpense({ category: 'Invitations', fn: 'General', vendor: 'Regal Invites & Co', amount: 38000, status: 'Paid', method: 'UPI', paidBy: 'Groom', daysAgo: 35 })
  addExpense({ category: 'Entertainment', fn: 'Sangeet', vendor: 'Beats & Baraat Entertainment', amount: 90000, status: 'Partial', method: 'UPI', paidBy: 'Groom', daysAgo: 12, dueInDays: 7 })
  addExpense({ category: 'Transportation', fn: 'Wedding', vendor: null, amount: 35000, status: 'Paid', method: 'Cash', paidBy: "Groom's Family", daysAgo: 6, notes: 'Baraat car decoration and rentals.' })
  addExpense({ category: 'Accommodation', fn: 'Wedding', vendor: null, amount: 60000, status: 'Pending', method: 'Bank Transfer', paidBy: "Bride's Family", daysAgo: 3, dueInDays: -2, notes: 'Guest rooms block booking.' })
  addExpense({ category: 'Priest / Ceremony', fn: 'Wedding', vendor: null, amount: 21000, status: 'Paid', method: 'Cash', paidBy: 'Parents', daysAgo: 4 })
  addExpense({ category: 'Mehendi', fn: 'Mehendi', vendor: null, amount: 25000, status: 'Paid', method: 'UPI', paidBy: 'Bride', daysAgo: 9 })
  addExpense({ category: 'Flowers', fn: 'Haldi', vendor: null, amount: 18000, status: 'Paid', method: 'Cash', paidBy: 'Parents', daysAgo: 9 })
  addExpense({ category: 'Miscellaneous', fn: 'General', vendor: null, amount: 12500, status: 'Paid', method: 'Cash', paidBy: 'Other', daysAgo: 2, notes: 'Odds and ends for the week.' })

  const contributions = [
    { id: uid(), weddingId, source: "Bride's Family", amount: 800000, note: '', createdAt: iso(55) },
    { id: uid(), weddingId, source: "Groom's Family", amount: 750000, note: '', createdAt: iso(55) },
    { id: uid(), weddingId, source: 'Bride', amount: 400000, note: 'Personal savings', createdAt: iso(50) },
    { id: uid(), weddingId, source: 'Groom', amount: 300000, note: 'Personal savings', createdAt: iso(50) },
    { id: uid(), weddingId, source: 'Other', amount: 250000, note: 'Family gifts', createdAt: iso(40) },
  ]

  return { wedding, categories, functions, vendors, expenses, payments, contributions }
}
