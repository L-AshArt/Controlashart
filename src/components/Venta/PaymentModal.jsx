import { useState } from 'react'
import { X, Banknote, CreditCard, Building2, CheckCircle } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useToast } from '../Layout/Toast'
import { pNom } from '../../utils/products'
import TicketModal from './TicketModal'

const METHODS = [
  { id:'efectivo',      label:'Efectivo',     Icon:Banknote   },
  { id:'tarjeta',       label:'Tarjeta',       Icon:CreditCard },
  { id:'transferencia', label:'Transferencia', Icon:Building2  },
]

export default function PaymentModal({ items, extraData, onClose, onDone }) {
  const { db, update } = useDB()
  const toast = useToast()
  const [method, setMethod]   = useState('transferencia')
  const [efectivo, setEfectivo] = useState('')
  const [ventaGuardada, setVentaGuardada] = useState(null)

  const disc   = extraData?.disc || 0
  const total  = Math.max(0, items.reduce((s,{prod,qty})=>s+(prod.precioMenudeo||0)*qty,0) - disc)
  const cambio = method==='efectivo' ? Math.max(0, parseFloat(efectivo||0)-total) : 0

  function confirm() {
    const num  = (db.ventas?.length||0)+1
    const now  = new Date()
    const fecha = now.toLocaleDateString('es-MX')
    const hora  = now.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})

    const venta = {
      num, fecha, hora,
      items: items.map(({prod,qty})=>({
        prodId: typeof prod.id==='number'?prod.id:null,
        nombre: pNom(prod), precio: prod.precioMenudeo||0, qty, costo: prod.costo||0,
      })),
      tot: total, desc: disc, cambio, metodo: method,
      cliente: extraData?.clientName||'',
      nota: extraData?.note||'',
    }

    update('ventas', v=>[...(v||[]),venta])
    update('prods', ps=>ps.map(p=>{
      const it=items.find(i=>i.prod.id===p.id)
      return it?{...p,stock:Math.max(0,(p.stock||0)-it.qty)}:p
    }))

    setVentaGuardada(venta)
  }

  if (ventaGuardada) return (
    <TicketModal
      venta={ventaGuardada}
      onClose={() => { onDone(); toast('Venta #'+ventaGuardada.num+' registrada','ok') }}
    />
  )

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-surface-bg">
      <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-lg font-bold text-ink">Cobrar</h2>
        <button onClick={onClose} className="p-2 rounded-xl bg-surface-bg text-ink-2"><X size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="card text-center py-6">
          <p className="text-ink-3 text-sm mb-1">Total a cobrar</p>
          <p className="text-5xl font-bold text-ink">${total.toFixed(2)}</p>
          {disc>0 && <p className="text-xs text-ok mt-1">Descuento: -${disc.toFixed(2)}</p>}
        </div>

        <div className="card">
          <p className="section-title mb-3">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map(({id,label,Icon})=>(
              <button key={id} onClick={()=>setMethod(id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  method===id?'border-rosa bg-rosa-light':'border-gray-200 bg-surface-bg'
                }`}>
                <Icon size={20} className={method===id?'text-rosa':'text-ink-2'}/>
                <span className={`text-xs font-semibold ${method===id?'text-rosa':'text-ink-2'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {method==='efectivo' && (
          <div className="card space-y-3">
            <label className="section-title">Con cuanto paga</label>
            <input type="number" inputMode="decimal" className="input text-center text-2xl font-bold"
              placeholder="0.00" value={efectivo} onChange={e=>setEfectivo(e.target.value)}/>
            {cambio>0 && (
              <div className="p-3 bg-ok-light rounded-xl text-center">
                <p className="text-xs text-ok font-medium">Cambio</p>
                <p className="text-2xl font-bold text-ok">${cambio.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <p className="section-title mb-2">Resumen</p>
          {items.map(({prod,qty})=>(
            <div key={prod.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-ink-2 flex-1 truncate">{qty}x {pNom(prod)}</span>
              <span className="font-semibold text-ink ml-2">${((prod.precioMenudeo||0)*qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <button onClick={confirm} className="btn-primary w-full text-base py-4 flex items-center justify-between">
          <span>Confirmar pago</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  )
}
