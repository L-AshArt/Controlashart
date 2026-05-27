import { useState } from 'react'
import { X, Trash2, Pencil, Check } from 'lucide-react'
import { pNom } from '../../utils/products'

export default function Cart({ items, onAdd, onRemove, onClose, onCheckout, onClear, isAdmin, db }) {
  const [clientName, setClientName]       = useState('')
  const [coupon, setCoupon]               = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [note, setNote]                   = useState('')
  const [priceOverrides, setPriceOverrides] = useState({})  // {prodId: newPrice}
  const [editingPrice, setEditingPrice]   = useState(null)  // prodId being edited
  const [tempPrice, setTempPrice]         = useState('')

  function getPrice(prod) {
    return priceOverrides[prod.id] ?? prod.precioMenudeo
  }

  const subtotal = items.reduce((s, {prod, qty}) => s + getPrice(prod) * qty, 0)
  const disc = couponApplied?.tipo === 'pct'
    ? subtotal * couponApplied.valor / 100
    : couponApplied?.valor || 0
  const total = Math.max(0, subtotal - disc)

  function applyCoupon() {
    const c = db.cups?.find(x => x.code?.toLowerCase() === coupon.trim().toLowerCase() && x.activo)
    if (!c) { alert('Cupón no válido'); return }
    setCouponApplied(c)
  }

  function startEditPrice(prod) {
    setEditingPrice(prod.id)
    setTempPrice(String(getPrice(prod)))
  }

  function confirmEditPrice(prod) {
    const val = parseFloat(tempPrice)
    if (!isNaN(val) && val >= 0) {
      setPriceOverrides(p => ({...p, [prod.id]: val}))
    }
    setEditingPrice(null)
  }

  function checkout() {
    // Build items with overridden prices
    const enrichedItems = items.map(({prod, qty}) => ({
      prod: { ...prod, precioMenudeo: getPrice(prod) },
      qty,
    }))
    onCheckout({
      items: enrichedItems,
      total,
      disc,
      clientName,
      coupon: couponApplied,
      note,
    })
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-surface-bg">
      <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-ink">Carrito</h2>
          <p className="text-xs text-ink-3">{items.length} producto{items.length!==1?'s':''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClear} className="p-2 rounded-xl bg-danger-light text-danger">
            <Trash2 size={18}/>
          </button>
          <button onClick={onClose} className="p-2 rounded-xl bg-surface-bg text-ink-2">
            <X size={18}/>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.map(({prod, qty}) => {
          const precio = getPrice(prod)
          const isEditing = editingPrice === prod.id
          const hasOverride = priceOverrides[prod.id] !== undefined

          return (
            <div key={prod.id} className="card">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{pNom(prod)}</p>

                  {/* Price row */}
                  <div className="flex items-center gap-2 mt-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-ink-2">$</span>
                        <input
                          type="number" inputMode="decimal"
                          className="w-24 text-sm font-bold border-b-2 border-rosa outline-none bg-transparent"
                          value={tempPrice}
                          onChange={e => setTempPrice(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => confirmEditPrice(prod)}
                          className="w-6 h-6 rounded-full bg-ok flex items-center justify-center">
                          <Check size={12} className="text-white"/>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${hasOverride ? 'text-rosa' : 'text-ink-2'}`}>
                          ${precio.toFixed(2)} c/u
                        </span>
                        {hasOverride && (
                          <span className="text-[10px] text-ink-3 line-through">
                            ${prod.precioMenudeo.toFixed(2)}
                          </span>
                        )}
                        <button onClick={() => startEditPrice(prod)}
                          className="p-0.5 text-ink-3 active:text-rosa">
                          <Pencil size={12}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5">
                  <button onClick={()=>onRemove(prod)} className="w-7 h-7 rounded-lg bg-surface-bg text-ink font-bold flex items-center justify-center">−</button>
                  <span className="w-5 text-center font-bold text-sm">{qty}</span>
                  <button onClick={()=>onAdd(prod)} className="w-7 h-7 rounded-lg bg-rosa text-white flex items-center justify-center">+</button>
                  <span className="text-sm font-bold text-ink w-16 text-right">${(precio*qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Client */}
        <div className="card">
          <label className="section-title">Cliente (opcional)</label>
          <input className="input" placeholder="Nombre del cliente" value={clientName} onChange={e=>setClientName(e.target.value)}/>
        </div>

        {/* Coupon */}
        <div className="card">
          <label className="section-title">Cupón</label>
          {couponApplied ? (
            <div className="flex items-center justify-between">
              <span className="badge-gold">{couponApplied.code} · -{couponApplied.tipo==='pct'?couponApplied.valor+'%':'$'+couponApplied.valor}</span>
              <button onClick={()=>setCouponApplied(null)}><X size={14} className="text-ink-3"/></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Código de cupón" value={coupon} onChange={e=>setCoupon(e.target.value)}/>
              <button onClick={applyCoupon} className="btn-secondary px-3 py-2 text-sm">Aplicar</button>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="card">
          <label className="section-title">Nota interna</label>
          <input className="input" placeholder="Nota para la venta..." value={note} onChange={e=>setNote(e.target.value)}/>
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
        <button onClick={checkout} className="btn-primary w-full flex items-center justify-between">
          <span>Cobrar</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  )
}
