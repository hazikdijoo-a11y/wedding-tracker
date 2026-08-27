import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'

export function StatCard({ icon: Icon, iconColor, iconBg, label, value, delta, deltaKind }) {
  return (
    <div className="vl-stat">
      <div className="vl-stat-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon size={17} />
      </div>
      <div className="vl-stat-value">{value}</div>
      <div className="vl-stat-label">{label}</div>
      {delta ? (
        <span className={`vl-stat-delta vl-delta-${deltaKind || 'neutral'}`}>
          {deltaKind === 'good' ? <TrendingUp size={11} /> : deltaKind === 'bad' ? <TrendingDown size={11} /> : null}
          {delta}
        </span>
      ) : null}
    </div>
  )
}

export function ProgressBar({ pct, state = 'good', height }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="vl-progress-track" style={height ? { height } : undefined}>
      <div className={`vl-progress-fill vl-fill-${state}`} style={{ width: `${clamped}%` }} />
    </div>
  )
}

export function CircularProgress({ pct, size = 132, stroke = 12, state = 'good', children }) {
  const clamped = Math.max(0, Math.min(100, pct))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const color = state === 'over' ? 'var(--red)' : state === 'watch' ? 'var(--amber)' : 'var(--green)'
  return (
    <div className="vl-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="vl-ring-center">{children}</div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    Paid: { cls: 'vl-badge-paid', label: 'Paid' },
    Partial: { cls: 'vl-badge-partial', label: 'Partial' },
    Pending: { cls: 'vl-badge-pending', label: 'Pending' },
  }
  const s = map[status] || map.Pending
  return (
    <span className={`vl-badge ${s.cls}`}>
      <span className="vl-badge-dot" style={{ background: 'currentColor' }} />
      {s.label}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="vl-empty">
      <div className="vl-empty-icon"><Icon size={30} /></div>
      <div className="vl-empty-title">{title}</div>
      <div className="vl-empty-text">{text}</div>
      {action}
    </div>
  )
}

export function Sheet({ title, onClose, children, footer, maxWidth }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return createPortal(
    <div className="vl-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="vl-sheet" style={maxWidth ? { maxWidth } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="vl-sheet-handle" />
        <div className="vl-sheet-head">
          <h3 className="vl-sheet-title">{title}</h3>
          <button className="vl-iconbtn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="vl-sheet-body">{children}</div>
        {footer ? <div className="vl-sheet-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return createPortal(
    <div className="vl-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.() }}>
      <div className="vl-sheet" style={{ maxWidth: 400 }} role="alertdialog" aria-modal="true">
        <div style={{ padding: '26px 24px 22px' }}>
          {danger ? <div className="vl-confirm-icon"><AlertTriangle size={24} /></div> : null}
          <h3 style={{ fontSize: 19, marginBottom: 8 }}>{title}</h3>
          <p className="vl-muted" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 22 }}>{message}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="vl-btn vl-btn-secondary vl-btn-block" onClick={onCancel}>Cancel</button>
            <button className={`vl-btn vl-btn-block ${danger ? 'vl-btn-danger-solid' : 'vl-btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ToastHost({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3200)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null
  return createPortal(
    <div className="vl-toast-wrap">
      <div className="vl-toast">
        <CheckCircle2 size={18} className="vl-toast-icon" />
        <span>{toast.message}</span>
      </div>
    </div>,
    document.body
  )
}
