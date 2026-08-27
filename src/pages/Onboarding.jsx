import { useState } from 'react'
import { Gem, Sparkles, Check } from 'lucide-react'
import { useWedding } from '../context/WeddingContext'
import { DEFAULT_CATEGORIES, DEFAULT_FUNCTIONS } from '../lib/db'
import { CategoryIcon } from '../lib/icons'

const TOTAL_STEPS = 4

export default function Onboarding() {
  const { createWedding, addCategory, addFunction, loadDemo } = useWedding()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [weddingName, setWeddingName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [city, setCity] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [selectedFunctions, setSelectedFunctions] = useState(['Engagement', 'Wedding', 'Reception'])
  const [customFunction, setCustomFunction] = useState('')
  const [catBudgets, setCatBudgets] = useState(() => Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.name, ''])))

  const namesReady = brideName.trim() && groomName.trim() && weddingDate
  const canNext = step === 1 ? namesReady : step === 2 ? Number(totalBudget) > 0 : step === 3 ? selectedFunctions.length > 0 : true

  function toggleFunction(name) {
    setSelectedFunctions((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]))
  }

  function addCustomFunction() {
    const name = customFunction.trim()
    if (!name || selectedFunctions.includes(name)) return
    setSelectedFunctions((prev) => [...prev, name])
    setCustomFunction('')
  }

  async function finish() {
    setSaving(true)
    const name = weddingName.trim() || `${brideName} & ${groomName}'s Wedding`
    const wedding = await createWedding({
      weddingName: name, brideName, groomName, weddingDate, city,
      totalBudget: Number(totalBudget) || 0,
    })
    for (const fname of selectedFunctions) {
      await addFunction({ weddingId: wedding.id, name: fname, budget: 0, date: null })
    }
    for (const c of DEFAULT_CATEGORIES) {
      await addCategory({ weddingId: wedding.id, name: c.name, icon: c.icon, budget: Number(catBudgets[c.name]) || 0 })
    }
    setSaving(false)
  }

  return (
    <div className="vl-onboard">
      <div className="vl-onboard-head" style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div className="vl-onboard-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => <span key={i} className={i < step ? 'done' : ''} />)}
        </div>
      </div>

      <div className="vl-onboard-body">
        {step === 1 && (
          <>
            <div className="vl-onboard-icon"><Gem size={26} /></div>
            <h1 className="vl-onboard-title">Tell us about your wedding</h1>
            <p className="vl-onboard-sub">Let's set up your financial command center. Step 1 of {TOTAL_STEPS}.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="vl-field" style={{ flex: 1 }}>
                <label className="vl-field-label">Bride's Name</label>
                <input className="vl-input" value={brideName} onChange={(e) => setBrideName(e.target.value)} placeholder="Aisha" />
              </div>
              <div className="vl-field" style={{ flex: 1 }}>
                <label className="vl-field-label">Groom's Name</label>
                <input className="vl-input" value={groomName} onChange={(e) => setGroomName(e.target.value)} placeholder="Rahul" />
              </div>
            </div>
            <div className="vl-field">
              <label className="vl-field-label">Wedding Name (optional)</label>
              <input className="vl-input" value={weddingName} onChange={(e) => setWeddingName(e.target.value)} placeholder="Aisha & Rahul's Wedding" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="vl-field" style={{ flex: 1 }}>
                <label className="vl-field-label">Wedding Date</label>
                <input type="date" className="vl-input" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
              </div>
              <div className="vl-field" style={{ flex: 1 }}>
                <label className="vl-field-label">City</label>
                <input className="vl-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jaipur" />
              </div>
            </div>
            <button className="vl-link-btn" style={{ marginTop: 8, textAlign: 'left' }} onClick={loadDemo}>
              <Sparkles size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Just exploring? Load sample data instead
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="vl-onboard-icon"><Gem size={26} /></div>
            <h1 className="vl-onboard-title">What's your budget?</h1>
            <p className="vl-onboard-sub">This is your overall wedding budget. You can always change it later. Step 2 of {TOTAL_STEPS}.</p>
            <div className="vl-amount-wrap">
              <span className="vl-amount-symbol">₹</span>
              <input className="vl-amount-input" inputMode="decimal" autoFocus placeholder="25,00,000" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value.replace(/[^0-9.]/g, ''))} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="vl-onboard-icon"><Gem size={26} /></div>
            <h1 className="vl-onboard-title">What functions are you having?</h1>
            <p className="vl-onboard-sub">Select every event you're celebrating. Step 3 of {TOTAL_STEPS}.</p>
            <div className="vl-check-list">
              {DEFAULT_FUNCTIONS.map((f) => (
                <div key={f} className={`vl-check-item${selectedFunctions.includes(f) ? ' selected' : ''}`} onClick={() => toggleFunction(f)}>
                  <span className="vl-checkbox">{selectedFunctions.includes(f) ? <Check size={13} /> : null}</span>
                  {f}
                </div>
              ))}
              {selectedFunctions.filter((f) => !DEFAULT_FUNCTIONS.includes(f)).map((f) => (
                <div key={f} className="vl-check-item selected" onClick={() => toggleFunction(f)}>
                  <span className="vl-checkbox"><Check size={13} /></span>{f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input className="vl-input" placeholder="Add a custom function…" value={customFunction} onChange={(e) => setCustomFunction(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomFunction()} />
              <button className="vl-btn vl-btn-secondary" onClick={addCustomFunction}>Add</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="vl-onboard-icon"><Gem size={26} /></div>
            <h1 className="vl-onboard-title">Set your budget categories</h1>
            <p className="vl-onboard-sub">We've suggested categories every Indian wedding needs. Set a budget for each, or leave blank and fill in later. Step 4 of {TOTAL_STEPS}.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
              {DEFAULT_CATEGORIES.map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="vl-chip-icon" style={{ flexShrink: 0 }}><CategoryIcon name={c.icon} size={16} /></span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                  <input
                    className="vl-input" style={{ width: 130 }} inputMode="decimal" placeholder="₹ 0"
                    value={catBudgets[c.name]}
                    onChange={(e) => setCatBudgets((prev) => ({ ...prev, [c.name]: e.target.value.replace(/[^0-9.]/g, '') }))}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="vl-onboard-footer">
        {step > 1 ? <button className="vl-btn vl-btn-secondary" onClick={() => setStep((s) => s - 1)}>Back</button> : null}
        {step < TOTAL_STEPS ? (
          <button className="vl-btn vl-btn-primary vl-btn-block" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue</button>
        ) : (
          <button className="vl-btn vl-btn-primary vl-btn-block" disabled={saving} onClick={finish}>{saving ? 'Setting up…' : 'Go to Dashboard'}</button>
        )}
      </div>
    </div>
  )
}
