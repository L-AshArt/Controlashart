import { useState } from 'react'
import { X, Save, Plus, Minus } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useToast } from '../Layout/Toast'
import { pNom } from '../../utils/products'

export default function ProductEditModal({ prod, onClose }) {
  const { update } = useDB()
  const toast = useToast()

  const [stock,       setStock]       = useState(prod.stock       ?? 0)
  const [stockBodega, setStockBodega] = useState(prod.stockBodega ?? 0)
  const [precioM,     setPrecioM]     = useState(prod.precioMenudeo  ?? 0)
  const [precioMay,   setPrecioMay]   = useState(prod.precioMayoreo  ?? 0)
  const [costo,       setCosto]       = useState(prod.costo          ?? 0)
  const [notas,       setNotas]       = useState(prod.notas          ?? '')

  function save() {
    update('prods', ps => ps.map(p => p.id === prod.id ? {
      ...p,
      stock:         Number(stock),
      stockBodega:   Number(stockBodega),
      precioMenudeo: Number(precioM),
      precioMayoreo: Number(precioMay),
      costo:         Number(costo),
      notas,
    } : p))
    toast('Producto actualizado', 'ok')
    onClose()
  }

  function adj(setter, val, delta) {
    setter(Math.max(0, Number(val) + delta))
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-ink">Editar producto</h3>
            <p className="text-xs text-ink-3 truncate max-w-[260px]">{pNom(prod)}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Stock tienda */}
          <div className="card">
            <label className="section-title">Stock tienda</label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={()=>adj(setStock,stock,-1)}
                className="w-10 h-10 rounded-xl bg-danger-light text-danger flex items-center justify-center">
                <Minus size={18}/>
              </button>
              <input type="number" inputMode="numeric"
                className="input flex-1 text-center text-2xl font-bold"
                value={stock} onChange={e=>setStock(e.target.value)}/>
              <button onClick={()=>adj(setStock,stock,+1)}
                className="w-10 h-10 rounded-xl bg-ok-light text-ok flex items-center justify-center">
                <Plus size={18}/>
              </button>
            </div>
          </div>

          {/* Stock bodega */}
          <div className="card">
            <label className="section-title">Stock bodega</label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={()=>adj(setStockBodega,stockBodega,-1)}
                className="w-10 h-10 rounded-xl bg-danger-light text-danger flex items-center justify-center">
                <Minus size={18}/>
              </button>
              <input type="number" inputMode="numeric"
                className="input flex-1 text-center text-2xl font-bold"
                value={stockBodega} onChange={e=>setStockBodega(e.target.value)}/>
              <button onClick={()=>adj(setStockBodega,stockBodega,+1)}
                className="w-10 h-10 rounded-xl bg-ok-light text-ok flex items-center justify-center">
                <Plus size={18}/>
              </button>
            </div>
          </div>

          {/* Precios */}
          <div className="card space-y-3">
            <label className="section-title">Precios</label>
            <div>
              <p className="text-xs text-ink-2 mb-1">Precio menudeo</p>
              <input type="number" inputMode="decimal" className="input"
                value={precioM} onChange={e=>setPrecioM(e.target.value)}/>
            </div>
            <div>
              <p className="text-xs text-ink-2 mb-1">Precio mayoreo</p>
              <input type="number" inputMode="decimal" className="input"
                value={precioMay} onChange={e=>setPrecioMay(e.target.value)}/>
            </div>
            <div>
              <p className="text-xs text-ink-2 mb-1">Costo</p>
              <input type="number" inputMode="decimal" className="input"
                value={costo} onChange={e=>setCosto(e.target.value)}/>
            </div>
          </div>

          {/* Notas */}
          <div className="card">
            <label className="section-title">Notas</label>
            <input className="input mt-1" placeholder="Ej. Cafe, especial, nuevo..."
              value={notas} onChange={e=>setNotas(e.target.value)}/>
          </div>

          <button onClick={save} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            <Save size={18}/> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
