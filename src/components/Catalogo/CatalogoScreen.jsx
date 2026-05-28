import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useAuth } from '../../context/AuthContext'
import { pNom, tLabel, tColor, marcaP, numSort, stockColor } from '../../utils/products'
import Header from '../Layout/Header'
import ProductEditModal from './ProductEditModal'
import ProductForm from './ProductForm'

export default function CatalogoScreen() {
  const { db, update } = useDB()
  const { isAdmin } = useAuth()
  const [tab,     setTab]     = useState('prods')
  const [catF,    setCatF]    = useState('todos')
  const [query,   setQuery]   = useState('')
  const [editProd, setEditProd] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const TIPOS = ['todos','clasica','tec','abanico','adhesivo','pinza','insumo','otro']

  const prods = useMemo(() => {
    let fl = catF==='todos' ? db.prods : db.prods.filter(p=>p.tipo===catF)
    if (query) fl = fl.filter(p=>pNom(p).toLowerCase().includes(query.toLowerCase()))
    return fl.sort((a,b)=>numSort(pNom(a),pNom(b)))
  }, [db.prods, catF, query])

  function delProd(id) {
    if (!confirm('Eliminar este producto?')) return
    update('prods', ps => ps.filter(p=>p.id!==id))
  }

  const grouped = useMemo(() => {
    const groups = {}
    prods.forEach(p => {
      const m = marcaP(p)||'Sin marca'
      if (!groups[m]) groups[m] = []
      groups[m].push(p)
    })
    return Object.keys(groups)
      .sort((a,b)=>a==='Sin marca'?1:b==='Sin marca'?-1:a.localeCompare(b))
      .map(m => ({ marca: m, ps: groups[m] }))
  }, [prods])

  return (
    <div>
      <Header
        title="Catálogo"
        right={
          isAdmin ? (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-3 py-2 text-sm flex items-center gap-1.5"
            >
              <Plus size={16}/> Agregar
            </button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="flex bg-white mx-4 mt-3 rounded-xl p-1 gap-1 shadow-card">
        <button onClick={()=>setTab('prods')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab==='prods'?'bg-rosa text-white':'text-ink-2'}`}>
          Productos
        </button>
        <button onClick={()=>setTab('bodega')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab==='bodega'?'bg-rosa text-white':'text-ink-2'}`}>
          Bodega
        </button>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-6">
        {tab === 'prods' && (
          <>
            <p className="text-xs text-ink-3">{db.prods?.length||0} productos</p>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"/>
              <input className="input pl-9" placeholder="Buscar..." value={query} onChange={e=>setQuery(e.target.value)}/>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {TIPOS.map(t=>(
                <button key={t} onClick={()=>setCatF(t)} className={`chip whitespace-nowrap flex-shrink-0 text-xs ${t===catF?'chip-active':''}`}>
                  {t==='todos'?'Todos':tLabel(t)}
                </button>
              ))}
            </div>

            {grouped.map(({ marca, ps }) => (
              <div key={marca}>
                <div className="flex items-center justify-between py-2 px-3 bg-rosa/10 rounded-xl mb-2">
                  <span className="text-sm font-bold text-rosa">{marca}</span>
                  <span className="text-xs text-rosa/70">{ps.length} prod.</span>
                </div>
                <div className="space-y-2">
                  {ps.map(p => (
                    <div key={p.id} className="card flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tColor(p.tipo)}`}>
                          {tLabel(p.tipo)}
                        </span>
                        <p className="text-sm font-semibold text-ink mt-1 leading-tight">{pNom(p)}</p>
                        <p className="text-xs text-ink-2 mt-0.5">
                          Men: ${p.precioMenudeo?.toFixed(2)} · May: ${p.precioMayoreo?.toFixed(2)||'0.00'}
                          {isAdmin && p.costo ? ` · Costo: $${p.costo.toFixed(2)}` : ''}
                        </p>
                        {isAdmin && p.costo > 0 && (
                          <p className="text-xs font-semibold text-ok">
                            Ganancia: ${(p.precioMenudeo-p.costo).toFixed(2)} ({(((p.precioMenudeo-p.costo)/p.costo)*100).toFixed(0)}%)
                          </p>
                        )}
                        <p className={`text-xs font-medium mt-0.5 ${stockColor(p.stock)}`}>
                          Tienda: {p.stock}{p.stockBodega?` · Bodega: ${p.stockBodega}`:''}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => setEditProd(p)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"
                          >
                            <Pencil size={14}/>
                          </button>
                          <button
                            onClick={() => delProd(p.id)}
                            className="w-8 h-8 rounded-lg bg-danger-light text-danger flex items-center justify-center"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'bodega' && (
          <BodegaSection prods={db.prods||[]} onEdit={isAdmin?setEditProd:null}/>
        )}
      </div>

      {editProd && <ProductEditModal prod={editProd} onClose={()=>setEditProd(null)}/>}
      {showForm  && <ProductForm onClose={()=>setShowForm(false)}/>}
    </div>
  )
}

function BodegaSection({ prods, onEdit }) {
  const [query, setQuery] = useState('')

  const list = prods
    .filter(p => {
      const hasBodega = (p.stockBodega || 0) > 0
      if (!hasBodega) return false
      if (query) return pNom(p).toLowerCase().includes(query.toLowerCase())
      return true
    })
    .sort((a,b) => (b.stockBodega||0) - (a.stockBodega||0))

  const total = list.reduce((s,p) => s + (p.stockBodega||0), 0)
  const alertas = prods.filter(p => (p.stockBodega||0) > 0 && (p.stock||0) === 0)

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="card flex-1 text-center py-2">
          <p className="text-2xl font-bold text-ink">{list.length}</p>
          <p className="text-xs text-ink-3">productos</p>
        </div>
        <div className="card flex-1 text-center py-2">
          <p className="text-2xl font-bold text-ink">{total}</p>
          <p className="text-xs text-ink-3">unidades</p>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="bg-gold-light border border-gold/30 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-gold mb-1">⚠️ Sin stock en tienda — hay en bodega</p>
          {alertas.map(p => (
            <p key={p.id} className="text-xs text-ink-2">• {pNom(p)} ({p.stockBodega} en bodega)</p>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"/>
        <input className="input pl-9" placeholder="Buscar en bodega..."
          value={query} onChange={e=>setQuery(e.target.value)}/>
      </div>

      {list.length === 0
        ? <div className="card text-center py-8 text-ink-3">
            <p className="text-2xl mb-2">📦</p>
            <p className="text-sm">No hay productos en bodega</p>
          </div>
        : <div className="space-y-2">
            {list.map(p => (
              <div key={p.id} className="card flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink leading-tight">{pNom(p)}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-ink-3">
                      Bodega: <span className="font-bold text-blue-500">{p.stockBodega}</span>
                    </span>
                    <span className="text-xs text-ink-3">
                      Tienda: <span className={`font-bold ${p.stock>0?'text-ok':'text-danger'}`}>{p.stock||0}</span>
                    </span>
                  </div>
                </div>
                {onEdit && (
                  <button onClick={() => onEdit(p)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Pencil size={14}/>
                  </button>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  )
}
