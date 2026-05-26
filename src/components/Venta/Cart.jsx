import { useState } from 'react'
import { X, Trash2, ChevronRight, Tag, Percent } from 'lucide-react'
import { pNom } from '../../utils/products'

export default function Cart({ items, onAdd, onRemove, onClose, onCheckout, onClear, isAdmin, db }) {
  const [clientName, setClientName] = useState('')
  const [coupon, setCoupon]         = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [note, setNote]             = useState('')

  const subtotal = items.reduce((s, { prod, qty }) => s + prod.precioMenudeo * qty, 0)
  const disc = couponApplied?.tipo === 'pct'
    ? subtotal * couponApplied.valor / 100
    : couponApplied?.valor || 0
  const total = Math.max(0, subtotal - disc)

  function applyCoupon() {
    const c = db.cups?.find(x => x.code?.toLowerCase() === coupon.trim().toLowerCase() && x.activo)
    if (!c) { alert('Cupón no válido'); return }
    setCouponApplied(c)
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-surface-bg">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-ink">Carrito</h2>
          <p className="text-xs text-ink-3">{items.length} producto{items.length!==1?'s':''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClear} className="p-2 rounded-xl bg-danger-light text-danger">
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded-xl bg-surface-bg text-ink-2">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.map(({ prod, qty }) => (
          <div key={prod.id} className="card flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{pNom(prod)}</p>
              <p className="text-xs text-ink-2">${prod.precioMenudeo?.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>onRemove(prod)} className="w-7 h-7 rounded-lg bg-surface-bg text-ink font-bold text-lg flex items-center justify-center">−</button>
              <span className="w-5 text-center font-bold text-sm">{qty}</span>
              <button onClick={()=>onAdd(prod)} className="w-7 h-7 rounded-lg bg-rosa text-white flex items-center justify-center">+</button>
              <span className="text-sm font-bold text-ink w-16 text-right">${(prod.precioMenudeo*qty).toFixed(2)}</span>
            </div>
          </div>
        ))}

        {/* Client */}
        <div className="card">
          <label className="section-title">Cliente (opcional)</label>
          <input className="input" placeholder="Nombre del cliente" value={clientName} onChange={e=>setClientName(e.target.value)} />
        </div>

        {/* Coupon */}
        <div className="card">
          <label className="section-title">Cupón</label>
          {couponApplied ? (
            <div className="flex items-center justify-between">
              <span className="badge-gold">{couponApplied.code} · -{couponApplied.tipo==='pct'?couponApplied.valor+'%':'$'+couponApplied.valor}</span>
              <button onClick={()=>setCouponApplied(null)} className="text-ink-3"><X size={14}/></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Código de cupón" value={coupon} onChange={e=>setCoupon(e.target.value)} />
              <button onClick={applyCoupon} className="btn-secondary px-3 py-2 text-sm">Aplicar</button>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="card">
          <label className="section-title">Nota interna</label>
          <input className="input" placeholder="Nota para la venta..." value={note} onChange={e=>setNote(e.target.value)} />
        </div>
      </div>

      {/* Summary + checkout */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-ink-2">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          {disc > 0 && (
            <div className="flex justify-between text-sm text-ok">
              <span>Descuento</span><span>-${disc.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink pt-1 border-t border-gray-100">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => onCheckout({ items, total, disc, clientName, coupon: couponApplied, note })}
          className="btn-primary w-full flex items-center justify-between"
        >
          <span>Cobrar</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  )
}
