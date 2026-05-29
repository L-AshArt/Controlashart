import { useState, useMemo } from 'react'
import { Plus, Search, X, Star } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useFavoritos } from '../../context/FavoritosContext'
import { pNom, tLabel, tColor, numSort } from '../../utils/products'
import Header from '../Layout/Header'
import Cart from './Cart'
import PaymentModal from './PaymentModal'
import LibreModal from './LibreModal'
import StockAlerts from '../Layout/StockAlerts'
import ProductEditModal from '../Catalogo/ProductEditModal'

const TIPOS = ['todos','clasica','tec','abanico','adhesivo','pinza','insumo','otro']
const FIBER = ['clasica','tec','abanico']

function largo(l) {
  if (!l) return ''
  if (l === 'Mix') return 'Mix'
  if (l === 'custom') return 'Otro'
  return l + 'mm'
}

export default function VentaScreen() {
  const { db } = useDB()
  const { isAdmin } = useAuth()
  const { favs, toggle, isFav } = useFavoritos()
  const { cart, cartItems, addToCart, remFromCart, clearCart, cartCount, cartTotal, libres, addLibre, remLibre } = useCart()

  const [tipo,     setTipo]     = useState('todos')
  const [marca,    setMarca]    = useState('todas')
  const [query,    setQuery]    = useState('')
  const [selState, setSelState] = useState({})
  const [showCart, setShowCart] = useState(false)
  const [showPay,  setShowPay]  = useState(null)
  const [showLibre,setShowLibre]= useState(false)
  const [editProd, setEditProd] = useState(null)

  const prods = useMemo(() => {
    let fl = (db.prods || []).map(p => ({ ...p, tipo: p.tipo || 'otro' }))
    if (tipo !== 'todos') fl = fl.filter(p => p.tipo === tipo)
    if (marca !== 'todas') {
      fl = fl.filter(p => {
        const m = p.marca || (p.tipo === 'clasica' ? 'Nagaraku' : 'Sin marca')
        return m === marca
      })
    }
    if (query) {
      const q = query.toLowerCase()
      fl = fl.filter(p => pNom(p).toLowerCase().includes(q))
    }
    return fl.sort((a, b) => numSort(pNom(a), pNom(b)))
  }, [db.prods, tipo, marca, query])

  const marcas = useMemo(() => {
    const fl = (db.prods || []).map(p => ({ ...p, tipo: p.tipo || 'otro' }))
    const src = tipo === 'todos' ? fl : fl.filter(p => p.tipo === tipo)
    const ms = [...new Set(src.map(p => p.marca || (p.tipo === 'clasica' ? 'Nagaraku' : 'Sin marca')))]
    return ms.filter(Boolean).sort()
  }, [db.prods, tipo])

  const favProds = useMemo(() => (db.prods || []).filter(p => isFav(p.id)), [db.prods, favs])

  const byTipo = useMemo(() => {
    const ORDER = ['clasica','tec','abanico','adhesivo','pinza','insumo','otro']
    const groups = {}
    prods.forEach(p => {
      const k = p.tipo || 'otro'
      if (!groups[k]) groups[k] = []
      groups[k].push(p)
    })
    return Object.entries(groups).sort(([a],[b]) => {
      const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
  }, [prods])

  const mayoreoRules = db.mayoreo || []
  const items = cartItems(db.prods || [], mayoreoRules)
  const count = cartCount(db.prods || [], mayoreoRules)
  const total = cartTotal(db.prods || [], mayoreoRules)

  function handleCheckout(data) {
    setShowCart(false)
    setShowPay(data)
  }

  return (
    <div className="pb-24">
      <Header title="Venta" right={
        <button onClick={() => setShowLibre(true)} className="btn-primary px-3 py-2 text-sm">+ Libre</button>
      }/>

      <div className="px-4 pt-3 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"/>
            <input className="input pl-9" placeholder="Buscar producto..."
              value={query} onChange={e => setQuery(e.target.value)}/>
          </div>
          {query && (
            <button onClick={() => setQuery('')} className="p-2 text-ink-3">
              <X size={18}/>
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TIPOS.map(t => (
            <button key={t} onClick={() => { setTipo(t); setMarca('todas') }}
              className={'chip whitespace-nowrap flex-shrink-0 text-xs ' + (t === tipo ? 'chip-active' : '')}>
              {t === 'todos' ? 'Todos' : tLabel(t)}
            </button>
          ))}
        </div>

        {marcas.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setMarca('todas')}
              className={'chip whitespace-nowrap flex-shrink-0 text-xs ' + (marca === 'todas' ? 'chip-active' : '')}>
              Todas
            </button>
            {marcas.map(m => (
              <button key={m} onClick={() => setMarca(m)}
                className={'chip whitespace-nowrap flex-shrink-0 text-xs ' + (m === marca ? 'chip-active' : '')}>
                {m}
              </button>
            ))}
          </div>
        )}

        <StockAlerts prods={db.prods || []}/>

        {!query && favProds.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gold mb-2">Favoritos</p>
            <div className="space-y-2">
              {favProds.map(p => (
                <ProductRow key={p.id} prod={p} qty={cart[p.id] || 0}
                  onAdd={addToCart} onRem={remFromCart}
                  isFav={isFav(p.id)} onToggleFav={() => toggle(p.id)}
                  onEdit={isAdmin ? setEditProd : null}/>
              ))}
            </div>
          </div>
        )}

        {query ? (
          <div className="space-y-2">
            {prods.map((p, i) => (
              <ProductRow key={String(p.id) + '_' + i} prod={p} qty={cart[p.id] || 0}
                onAdd={addToCart} onRem={remFromCart}
                isFav={isFav(p.id)} onToggleFav={() => toggle(p.id)}
                onEdit={isAdmin ? setEditProd : null}/>
            ))}
            {prods.length === 0 && (
              <p className="text-center text-ink-3 text-sm py-4">Sin resultados</p>
            )}
          </div>
        ) : (
          <div>
            {byTipo.map(([t, ps]) => (
              <div key={t} className="mb-4">
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + tColor(t)}>
                    {tLabel(t)}
                  </span>
                </div>
                {t === 'clasica' ? (
                  <ClasicaSection ps={ps} cart={cart} onAdd={addToCart} onRem={remFromCart}
                    sel={selState} setSel={setSelState} isFav={isFav} toggleFav={toggle}
                    onEdit={isAdmin ? setEditProd : null}/>
                ) : t === 'tec' ? (
                  <TecSection ps={ps} cart={cart} onAdd={addToCart} onRem={remFromCart}
                    sel={selState} setSel={setSelState} isFav={isFav} toggleFav={toggle}
                    onEdit={isAdmin ? setEditProd : null}/>
                ) : t === 'abanico' ? (
                  <AbanicoSection ps={ps} cart={cart} onAdd={addToCart} onRem={remFromCart}
                    sel={selState} setSel={setSelState} isFav={isFav} toggleFav={toggle}
                    onEdit={isAdmin ? setEditProd : null}/>
                ) : (
                  <div className="space-y-2">
                    {ps.map((p, i) => (
                      <ProductRow key={String(p.id) + '_' + i} prod={p} qty={cart[p.id] || 0}
                        onAdd={addToCart} onRem={remFromCart}
                        isFav={isFav(p.id)} onToggleFav={() => toggle(p.id)}
                        onEdit={isAdmin ? setEditProd : null}/>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {byTipo.length === 0 && (
              <p className="text-center text-ink-3 text-sm py-8">Sin productos</p>
            )}
          </div>
        )}
      </div>

      {count > 0 && (
        <button onClick={() => setShowCart(true)}
          className="fixed bottom-20 left-4 right-4 bg-ink text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl z-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rosa flex items-center justify-center text-xs font-bold">
              {count}
            </div>
            <span className="font-semibold">Ver carrito</span>
          </div>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </button>
      )}

      {editProd && (
        <ProductEditModal prod={editProd} onClose={() => setEditProd(null)}/>
      )}
      {showLibre && (
        <LibreModal onClose={() => setShowLibre(false)}
          onAddLibre={item => { addLibre(item); setShowLibre(false) }}
          isAdmin={isAdmin}/>
      )}
      {showCart && (
        <Cart items={items} libres={libres}
          onAdd={addToCart} onRemove={remFromCart}
          onAddLibre={addLibre} onRemLibre={remLibre}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
          onClear={() => { clearCart(); setShowCart(false) }}
          isAdmin={isAdmin} db={db}/>
      )}
      {showPay && (
        <PaymentModal
          items={showPay.items}
          extraData={{ total: showPay.total, disc: showPay.disc, clientName: showPay.clientName, coupon: showPay.coupon, note: showPay.note }}
          onClose={() => setShowPay(null)}
          onDone={() => { setShowPay(null); clearCart() }}/>
      )}
    </div>
  )
}

function ProductRow({ prod, qty, onAdd, onRem, isFav, onToggleFav, onEdit }) {
  const ss = (prod.stock || 0) <= 0
  return (
    <div className={'card flex items-center gap-3 mb-2 ' + (ss ? 'opacity-50' : '')}>
      <div className="flex-1 min-w-0">
        {prod.notas && (
          <span className="badge-rosa text-[10px] mb-1 block w-fit">{prod.notas}</span>
        )}
        <p className="text-sm font-semibold text-ink leading-tight">{pNom(prod)}</p>
        <p className="text-xs text-ink-2 mt-0.5">
          {ss ? 'Sin stock' : '$' + (prod.precioMenudeo || 0).toFixed(2)}
          {prod.precioMayoreo > 0 ? ' · May: $' + prod.precioMayoreo.toFixed(2) : ''}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {qty > 0 && (
          <>
            <button onClick={() => onRem(prod)}
              className="w-7 h-7 rounded-lg bg-surface-bg text-ink font-bold flex items-center justify-center">
              -
            </button>
            <span className="w-5 text-center font-bold text-sm">{qty}</span>
          </>
        )}
        <button onClick={onToggleFav} className="p-1 text-ink-3 active:text-gold">
          <span className="text-base">{isFav ? '\u2605' : '\u2606'}</span>
        </button>
        {ss && onEdit && (
          <button onClick={() => onEdit(prod)}
            className="w-7 h-7 rounded-lg bg-gold-light text-gold flex items-center justify-center font-bold text-sm">
            +
          </button>
        )}
        <button onClick={() => onAdd(prod)} disabled={ss || qty >= (prod.stock || 0)}
          className="w-8 h-8 rounded-lg bg-rosa text-white flex items-center justify-center disabled:opacity-40">
          <Plus size={16}/>
        </button>
      </div>
    </div>
  )
}

function ClasicaSection({ ps, cart, onAdd, onRem, sel, setSel, isFav, toggleFav, onEdit }) {
  const byGr = {}
  ps.forEach(p => {
    const g = p.grosor || 'Sin grosor'
    if (!byGr[g]) byGr[g] = {}
    const c = p.curva || 'C'
    if (!byGr[g][c]) byGr[g][c] = []
    byGr[g][c].push(p)
  })

  return Object.keys(byGr).sort().map(gr => {
    const k = 'cl_' + gr
    const st = sel[k] || {}
    const curvs = Object.keys(byGr[gr]).sort()
    const pgC = st.curva ? byGr[gr][st.curva] || [] : []
    const lgs = [...new Set(pgC.map(p => p.largo))].sort((a, b) => {
      if (a === 'Mix') return 1
      if (b === 'Mix') return -1
      return parseInt(a || 0) - parseInt(b || 0)
    })

    return (
      <div key={gr} className="mb-3">
        <p className="text-xs font-bold text-ink-2 mb-2 pl-1">{gr} mm</p>
        <div className="flex gap-1.5 flex-wrap mb-1.5">
          <span className="text-[10px] text-ink-3 self-center">Curva</span>
          {curvs.map(c => {
            const lbl = c === 'custom' ? (byGr[gr][c][0]?.curvaLabel || 'Otra') : c
            return (
              <button key={c}
                onClick={() => setSel(s => ({ ...s, [k]: { curva: st.curva === c ? null : c } }))}
                className={'chip text-xs ' + (st.curva === c ? 'chip-active' : '')}>
                {lbl}
              </button>
            )
          })}
        </div>
        {st.curva && (
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            <span className="text-[10px] text-ink-3 self-center">Largo</span>
            {lgs.map(l => (
              <button key={l}
                onClick={() => setSel(s => ({ ...s, [k]: { ...st, largo: st.largo === l ? null : l } }))}
                className={'chip text-xs ' + (st.largo === l ? 'chip-active' : '')}>
                {largo(l)}
              </button>
            ))}
          </div>
        )}
        {st.curva && st.largo && pgC.filter(p => p.largo === st.largo).map((prod, pi) => (
          <ProductRow key={String(prod.id) + '_' + pi} prod={prod}
            qty={cart[prod.id] || 0} onAdd={onAdd} onRem={onRem}
            isFav={isFav(prod.id)} onToggleFav={() => toggleFav(prod.id)}
            onEdit={onEdit}/>
        ))}
      </div>
    )
  })
}

function TecSection({ ps, cart, onAdd, onRem, sel, setSel, isFav, toggleFav, onEdit }) {
  const byMarca = {}
  ps.forEach(p => {
    const m = p.marca || 'Sin marca'
    const d = p.dimension === 'custom' ? (p.dimensionLabel || 'Otro') : (p.dimension || (p.notas ? '(' + p.notas + ')' : 'Sin dimension'))
    if (!byMarca[m]) byMarca[m] = {}
    if (!byMarca[m][d]) byMarca[m][d] = []
    byMarca[m][d].push(p)
  })

  return Object.keys(byMarca).sort().map(marc => (
    <div key={marc} className="mb-3">
      <p className="text-sm font-bold text-ink-2 mb-2 pl-1">{marc}</p>
      {Object.keys(byMarca[marc]).sort().map(dim => {
        const gps = byMarca[marc][dim]
        const gk = 't_' + marc + '_' + dim
        const st = sel[gk] || {}
        const cvs = [...new Set(gps.map(p => p.curva))].sort((a, b) => {
          if (a === 'custom') return 1
          if (b === 'custom') return -1
          return a.localeCompare(b)
        })
        const pgC = st.curva ? gps.filter(p => p.curva === st.curva) : []
        const lgs = [...new Set(pgC.map(p => p.largo))].sort((a, b) => {
          if (a === 'Mix') return 1
          if (b === 'Mix') return -1
          return parseInt(a || 0) - parseInt(b || 0)
        })

        return (
          <div key={gk} className="mb-2 pl-2">
            <p className="text-xs font-semibold text-rosa mb-1.5">· {dim}</p>
            <div className="flex gap-1.5 flex-wrap mb-1.5">
              <span className="text-[10px] text-ink-3 self-center">Curva</span>
              {cvs.map(c => {
                const lbl = c === 'custom' ? (gps.find(p => p.curva === 'custom')?.curvaLabel || 'Otra') : c
                return (
                  <button key={c}
                    onClick={() => setSel(s => ({ ...s, [gk]: { curva: st.curva === c ? null : c } }))}
                    className={'chip text-xs ' + (st.curva === c ? 'chip-active' : '')}>
                    {lbl}
                  </button>
                )
              })}
            </div>
            {st.curva && (
              <div className="flex gap-1.5 flex-wrap mb-1.5">
                <span className="text-[10px] text-ink-3 self-center">Largo</span>
                {lgs.map(l => {
                  const lbl = l === 'Mix' ? 'Mix' : l === 'custom' ? (pgC.find(p => p.largo === 'custom')?.largoLabel || 'Otro') : l + 'mm'
                  return (
                    <button key={l}
                      onClick={() => setSel(s => ({ ...s, [gk]: { ...st, largo: st.largo === l ? null : l } }))}
                      className={'chip text-xs ' + (st.largo === l ? 'chip-active' : '')}>
                      {lbl}
                    </button>
                  )
                })}
              </div>
            )}
            {st.curva && st.largo && pgC.filter(p => p.largo === st.largo).map((prod, pi) => (
              <ProductRow key={String(prod.id) + '_' + pi} prod={prod}
                qty={cart[prod.id] || 0} onAdd={onAdd} onRem={onRem}
                isFav={isFav(prod.id)} onToggleFav={() => toggleFav(prod.id)}
                onEdit={onEdit}/>
            ))}
          </div>
        )
      })}
    </div>
  ))
}

function AbanicoSection({ ps, cart, onAdd, onRem, sel, setSel, isFav, toggleFav, onEdit }) {
  const byDim = {}
  ps.forEach(p => {
    const d = p.dimension === 'custom' ? (p.dimensionLabel || 'Otro') : (p.dimension || 'Sin dimension')
    if (!byDim[d]) byDim[d] = []
    byDim[d].push(p)
  })

  return Object.keys(byDim).sort().map(dim => {
    const gps = byDim[dim]
    const k = 'ab_' + dim
    const st = sel[k] || {}
    const grs = [...new Set(gps.map(p => p.grosor))].sort()
    const pg = st.grosor ? gps.filter(p => p.grosor === st.grosor) : (grs.length === 1 ? gps : [])
    const cvs = [...new Set(pg.map(p => p.curva))].sort((a, b) => {
      if (a === 'custom') return 1
      if (b === 'custom') return -1
      return a.localeCompare(b)
    })
    const pgC = st.curva ? pg.filter(p => p.curva === st.curva) : []
    const lgs = [...new Set(pgC.map(p => p.largo))].sort((a, b) => {
      if (a === 'Mix') return 1
      if (b === 'Mix') return -1
      return parseInt(a || 0) - parseInt(b || 0)
    })

    return (
      <div key={dim} className="mb-2">
        <p className="text-xs font-semibold text-ink-2 mb-1.5 pl-1">{dim}</p>
        {grs.length > 1 && (
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            <span className="text-[10px] text-ink-3 self-center">Grosor</span>
            {grs.map(g => (
              <button key={g}
                onClick={() => setSel(s => ({ ...s, [k]: { grosor: st.grosor === g ? null : g } }))}
                className={'chip text-xs ' + (st.grosor === g ? 'chip-active' : '')}>
                {g}
              </button>
            ))}
          </div>
        )}
        {(grs.length === 1 || st.grosor) && (
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            <span className="text-[10px] text-ink-3 self-center">Curva</span>
            {cvs.map(c => {
              const lbl = c === 'custom' ? (pg.find(p => p.curva === 'custom')?.curvaLabel || 'Otra') : c
              return (
                <button key={c}
                  onClick={() => setSel(s => ({ ...s, [k]: { ...st, curva: st.curva === c ? null : c, largo: null } }))}
                  className={'chip text-xs ' + (st.curva === c ? 'chip-active' : '')}>
                  {lbl}
                </button>
              )
            })}
          </div>
        )}
        {st.curva && (
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            <span className="text-[10px] text-ink-3 self-center">Largo</span>
            {lgs.map(l => (
              <button key={l}
                onClick={() => setSel(s => ({ ...s, [k]: { ...st, largo: st.largo === l ? null : l } }))}
                className={'chip text-xs ' + (st.largo === l ? 'chip-active' : '')}>
                {largo(l)}
              </button>
            ))}
          </div>
        )}
        {st.curva && st.largo && pgC.filter(p => p.largo === st.largo).map((prod, pi) => (
          <ProductRow key={String(prod.id) + '_' + pi} prod={prod}
            qty={cart[prod.id] || 0} onAdd={onAdd} onRem={onRem}
            isFav={isFav(prod.id)} onToggleFav={() => toggleFav(prod.id)}
      
