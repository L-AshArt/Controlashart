import { useState, useMemo } from 'react'
import { Search, X, Package, Receipt } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { pNom, numSort } from '../../utils/products'

export default function GlobalSearch({ onClose, onSelectProd }) {
  const { db } = useDB()
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    if (!q.trim()) return { prods:[], ventas:[] }
    const ql = q.toLowerCase()
    const prods = (db.prods||[])
      .filter(p => pNom(p).toLowerCase().includes(ql))
      .sort((a,b) => numSort(pNom(a),pNom(b)))
      .slice(0,8)
    const ventas = (db.ventas||[])
      .filter(v =>
        String(v.num).includes(ql) ||
        v.fecha?.includes(ql) ||
        v.items?.some(i=>i.nombre?.toLowerCase().includes(ql))
      )
      .slice(-5).reverse()
    return { prods, ventas }
  }, [q, db])

  return (
    <div className="fixed inset-0 z-40 bg-surface-bg flex flex-col">
      <div className="bg-white px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
        <Search size={20} className="text-ink-3 flex-shrink-0"/>
        <input
          autoFocus
          className="flex-1 text-base text-ink placeholder-ink-3 outline-none"
          placeholder="Buscar productos, ventas..."
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {!q.trim() && (
          <p className="text-center text-ink-3 text-sm pt-8">Escribe para buscar...</p>
        )}
        {results.prods.length>0 && (
          <div>
            <p className="section-title mb-2">Productos</p>
            <div className="space-y-2">
              {results.prods.map(p => (
                <button key={p.id} onClick={()=>{onSelectProd?.(p);onClose()}}
                  className="card w-full flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-rosa-light flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-rosa"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{pNom(p)}</p>
                    <p className="text-xs text-ink-3">${p.precioMenudeo?.toFixed(2)} · Stock: {p.stock}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {results.ventas.length>0 && (
          <div>
            <p className="section-title mb-2">Ventas</p>
            <div className="space-y-2">
              {results.ventas.map(v => (
                <div key={v.num} className="card flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-light flex items-center justify-center flex-shrink-0">
                    <Receipt size={16} className="text-gold"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">Venta #{v.num}</p>
                    <p className="text-xs text-ink-3">{v.fecha} · ${v.tot?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {q.trim()&&!results.prods.length&&!results.ventas.length && (
          <p className="text-center text-ink-3 text-sm pt-8">Sin resultados para "{q}"</p>
        )}
      </div>
    </div>
  )
}
