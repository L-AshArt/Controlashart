import { useState, useMemo } from 'react'
import { Search, Plus, Star } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useAuth } from '../../context/AuthContext'
import { useFavoritos } from '../../context/FavoritosContext'
import { useCart } from '../../context/CartContext'
import { pNom, tLabel, tColor, largo, numSort } from '../../utils/products'
import Cart from './Cart'
import PaymentModal from './PaymentModal'
import LibreModal from './LibreModal'
import GlobalSearch from '../Layout/GlobalSearch'
import StockAlerts from '../Layout/StockAlerts'
import ProductEditModal from '../Catalogo/ProductEditModal'

const TIPOS = ['todos','clasica','tec','abanico','adhesivo','pinza','insumo','otro']

export default function VentaScreen() {
  const { db } = useDB()
  const { isAdmin } = useAuth()
  const { favs, toggle, isFav } = useFavoritos()
  const { cart, setCart, cartItems, addToCart, remFromCart, clearCart, cartCount, cartTotal } = useCart()

  const [query, setQuery]         = useState('')
  const [tipo, setTipo]           = useState('todos')
  const [marca, setMarca]         = useState('todas')
  const [showCart, setShowCart]   = useState(false)
  const [showPay, setShowPay]     = useState(false)
  const [showLibre, setShowLibre] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [editProd, setEditProd] = useState(null)
  const [cartData, setCartData]   = useState(null)
  const [selState, setSelState]   = useState({})

  const prods = useMemo(() => {
    let fl = db.prods || []
    if (tipo !== 'todos') fl = fl.filter(p => p.tipo === tipo)
    if (marca !== 'todas') fl = fl.filter(p => (p.marca||(p.tipo==='clasica'?'Nagaraku':'Sin marca')) === marca)
    if (query) { const q=query.toLowerCase(); fl=fl.filter(p=>pNom(p).toLowerCase().includes(q)) }
    return fl.sort((a,b)=>numSort(pNom(a),pNom(b)))
  }, [db.prods, tipo, marca, query])

  const favProds = useMemo(() => (db.prods||[]).filter(p=>isFav(p.id)), [db.prods, favs])
  const marcas   = useMemo(() => {
    const fl = tipo==='todos' ? db.prods : (db.prods||[]).filter(p=>p.tipo===tipo)
    return [...new Set((fl||[]).map(p=>p.marca||(p.tipo==='clasica'?'Nagaraku':'Sin marca')).filter(Boolean))].sort()
  }, [db.prods, tipo])

  const items  = cartItems(db.prods || [])
  const count  = cartCount(db.prods || [])
  const total  = cartTotal(db.prods || [])

  function openCheckout(data) { setCartData(data); setShowCart(false); setShowPay(true) }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-bg">
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-2">
            <button onClick={()=>setShowSearch(true)}
              className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-ink-3 shadow-card">
              <Search size={16}/><span>Buscar producto...</span>
            </button>
            <button onClick={()=>setShowLibre(true)} className="btn-primary px-4 py-2.5 text-sm">+ Libre</button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-hide">
            {TIPOS.map(t=>(
              <button key={t} onClick={()=>{setTipo(t);setMarca('todas')}}
                className={`chip whitespace-nowrap flex-shrink-0 text-xs ${t===tipo?'chip-active':''}`}>
                {t==='todos'?'Todos':tLabel(t)}
              </button>
            ))}
          </div>
          {marcas.length>1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={()=>setMarca('todas')} className={`chip whitespace-nowrap flex-shrink-0 text-xs ${marca==='todas'?'chip-active':''}`}>Todas</button>
              {marcas.map(m=>(
                <button key={m} onClick={()=>setMarca(m)} className={`chip whitespace-nowrap flex-shrink-0 text-xs ${m===marca?'chip-active':''}`}>{m}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <StockAlerts />

      {favProds.length>0 && (
        <div className="px-4 mt-3 mb-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={12} className="text-gold fill-gold"/>
            <span className="section-title">Favoritos</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {favProds.map(p=>(
              <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0}
                className="flex-shrink-0 bg-white rounded-xl px-3 py-2.5 shadow-card min-w-[120px] text-left disabled:opacity-50">
                <p className="text-xs font-semibold text-ink leading-tight line-clamp-2">{pNom(p)}</p>
                <p className="text-xs text-rosa font-bold mt-1">${p.precioMenudeo?.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4 mt-2 space-y-2">
        {!query && (() => {
          const byTipo = {}
          prods.forEach(p=>{ const k=p.tipo||'otro'; if(!byTipo[k])byTipo[k]=[]; byTipo[k].push(p) })
          const ORDER=['clasica','tec','abanico','adhesivo','pinza','insumo','otro']
          const sorted=Object.entries(byTipo).sort(([a],[b])=>(ORDER.indexOf(a)<0?99:ORDER.indexOf(a))-(ORDER.indexOf(b)<0?99:ORDER.indexOf(b)))
          return sorted.map(([t,ps])=>(
            <div key={t}>
              <div className="flex items-center gap-2 mb-2 mt-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tColor(t)}`}>{tLabel(t)}</span>
              </div>
              {t==='clasica'  ? <ClasicaSection  ps={ps} cart={cart} onAdd={addToCart} onRem={remFromCart} sel={selState} setSel={setSelState} isFav={isFav} toggleFav={toggle} onEdit={isAdmin?setEditProd:null}/> :
               t==='tec'      ? <TecSection      ps={ps} cart={cart} onAdd={addToCart} onRem={remFromCart} sel={selState} setSel={setSelState} isFav={isFav} toggleFav={toggle} onEdit={isAdmin?setEditProd:null}/> :
               t==='abanico'  ? <AbanicoSection  ps={ps} cart={cart} onAdd={addToCart} onRem={remFromCart} sel={selState} setSel={setSelState} isFav={isFav} toggleFav={toggle} onEdit={isAdmin?setEditProd:null}/> :
               ps.map(p=><ProductRow key={p.id} prod={p} qty={cart[p.id]||0} onAdd={addToCart} onRem={remFromCart} isFav={isFav(p.id)} onToggleFav={()=>toggle(p.id)} onEdit={isAdmin?setEditProd:null}/>)}
            </div>
          ))
        })()}
        {query && prods.map(p=>(
          <ProductRow key={p.id} prod={p} qty={cart[p.id]||0} onAdd={addToCart} onRem={remFromCart} isFav={isFav(p.id)} onToggleFav={()=>toggle(p.id)} onEdit={isAdmin?setEditProd:null}/>
        ))}
      </div>

      {count>0 && (
        <div className="fixed bottom-16 left-0 right-0 px-4 z-20">
          <button onClick={()=>setShowCart(true)}
            className="w-full bg-ink text-white rounded-xl2 px-4 py-3.5 flex items-center justify-between shadow-card-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rosa flex items-center justify-center text-xs font-bold">{count}</div>
              <span className="font-semibold">Ver carrito</span>
            </div>
            <span className="font-bold text-lg">${total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {showSearch  && <GlobalSearch onClose={()=>setShowSearch(false)} onSelectProd={p=>{addToCart(p);setShowSearch(false)}}/>}
      {showCart    && <Cart items={items} onAdd={addToCart} onRemove={remFromCart} onClose={()=>setShowCart(false)} onCheckout={openCheckout} onClear={clearCart} isAdmin={isAdmin} db={db}/>}
      {showPay     && <PaymentModal items={items} extraData={cartData} onClose={()=>setShowPay(false)} onDone={()=>{setShowPay(false);clearCart()}}/>}
      {editProd   && <ProductEditModal prod={editProd} onClose={()=>setEditProd(null)}/>}
      {showLibre   && <LibreModal onClose={()=>setShowLibre(false)} cart={cart} setCart={setCart} isAdmin={isAdmin}/>}
    </div>
  )
}

function ProductRow({ prod, qty, onAdd, onRem, isFav, onToggleFav, onEdit }) {
  const ss = prod.stock <= 0
  return (
    <div className={`card flex items-center gap-3 mb-2 ${ss?'opacity-50':''}`}>
      <div className="flex-1 min-w-0">
        {prod.notas && <span className="badge-rosa text-[10px] mb-1 block w-fit">{prod.notas}</span>}
        <p className="text-sm font-semibold text-ink leading-tight">{pNom(prod)}</p>
        <p className="text-xs text-ink-2 mt-0.5">
          {ss?'Sin stock':`$${prod.precioMenudeo?.toFixed(2)}`}
          {prod.precioMayoreo?` · May: $${prod.precioMayoreo.toFixed(2)}`:''}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onToggleFav} className="p-1">
          <Star size={14} className={isFav?'text-gold fill-gold':'text-ink-3'}/>
        </button>
        {qty>0 && (
          <>
            <button onClick={()=>onRem(prod)} className="w-7 h-7 rounded-lg bg-surface-bg text-ink font-bold flex items-center justify-center">−</button>
            <span className="w-5 text-center text-sm font-bold">{qty}</span>
          </>
        )}
        {ss && onEdit && (
          <button onClick={()=>onEdit(prod)}
            className="w-8 h-8 rounded-lg bg-gold-light text-gold flex items-center justify-center">
            <span className="text-xs font-bold">+</span>
          </button>
        )}
        <button onClick={()=>onAdd(prod)} disabled={ss || qty >= prod.stock}
          className="w-8 h-8 rounded-lg bg-rosa text-white flex items-center justify-center disabled:opacity-40">
          <Plus size={16}/>
        </button>
      </div>
    </div>
  )
}

function ClasicaSection({ ps, cart, onAdd, onRem, sel, setSel, isFav, toggleFav, onEdit }) {
  const byMarca = {}
  ps.forEach(p=>{ const m=p.marca||'Nagaraku'; if(!byMarca[m])byMarca[m]=[]; byMarca[m].push(p) })
  return Object.keys(byMarca).sort().map(marca=>(
    <div key={marca} className="mb-3">
      <div className="py-1.5 px-3 bg-rosa/10 rounded-xl mb-2"><span className="text-sm font-bold text-rosa">{marca}</span></div>
      {[...new Set(byMarca[marca].map(p=>p.grosor))].sort((a,b)=>parseFloat(a)-parseFloat(b)).map(grosor=>{
        const pg=byMarca[marca].filter(p=>p.grosor===grosor), k=`c_${marca}_${grosor}`, st=sel[k]||{}
        const cvs=[...new Set(pg.map(p=>p.curva))].sort((a,b)=>a==='custom'?1:b==='custom'?-1:a.localeCompare(b))
        const pgC=st.curva?pg.filter(p=>p.curva===st.curva):[]
        const lgs=[...new Set(pgC.map(p=>p.largo))].sort((a,b)=>a==='Mix'?1:b==='Mix'?-1:parseInt(a||-1)-parseInt(b||-1))
        return (
          <div key={grosor} className="mb-2">
            <p className="text-xs font-semibold text-ink-2 mb-1.5 pl-1">{grosor} mm</p>
            <div className="flex gap-1.5 flex-wrap mb-1.5">
              <span className="text-[10px] text-ink-3 self-center">Curva</span>
              {cvs.map(c=>{
                const lbl=c==='custom'?(pg.find(p=>p.curva==='custom')?.curvaLabel||'Otra'):c
                return <button key={c} onClick={()=>setSel(s=>({...s,[k]:{curva:st.curva===c?null:c}}))}
                  className={`chip text-xs ${st.curva===c?'chip-active':''}`}>{lbl}</button>
              })}
            </div>
            {st.curva && <div className="flex gap-1.5 flex-wrap mb-1.5">
              <span className="text-[10px] text-ink-3 self-center">Largo</span>
              {lgs.map(l=><button key={l} onClick={()=>setSel(s=>({...s,[k]:{...st,largo:st.largo===l?null:l}}))}
                className={`chip text-xs ${st.largo===l?'chip-active':''}`}>{largo(l)}</button>)}
            </div>}
            {st.curva&&st.largo&&pgC.filter(p=>p.largo===st.largo).map(prod=>(
              <ProductRow key={prod.id} prod={prod} qty={cart[prod.id]||0} onAdd={onAdd} onRem={onRem} isFav={isFav(prod.id)} onToggleFav={()=>toggleFav(prod.id)} onEdit={onEdit}/>
            ))}
          </div>
        )
      })}
    </div>
  ))
}

function TecSection({ ps, cart, onAdd, onRem, sel, setSel, isFav, toggleFav, onEdit }) {
  // Group by marca first, then by dimension within each marca
  const marcaGroups = {}
  ps.forEach(p => {
    const m = p.marca || 'Sin marca'
    const d = p.dimension==='custom' ? p.dimensionLabel||'Otro' : (p.dimension || (p.notas ? `(${p.notas})` : 'Sin dimensión'))
    if (!marcaGroups[m]) marcaGroups[m] = {}
    if (!marcaGroups[m][d]) marcaGroups[m][d] = []
    marcaGroups[m][d].push(p)
  })

  return Object.entries(marcaGroups).sort(([a],[b])=>a.localeCompare(b)).map(([marca, dimGroups]) => (
    <div key={marca} className="mb-3">
      <p className="text-sm font-bold text-ink-2 mb-2 pl-1">{marca}</p>
      {Object.entries(dimGroups).sort(([a],[b])=>numSort(a,b)).map(([dim, gps]) => {
        const gk = `t_${marca}_${dim}`
        const st = sel[gk] || {}
        const cvs = [...new Set(gps.map(p=>p.curva))].sort((a,b)=>a==='custom'?1:b==='custom'?-1:a.localeCompare(b))
        const pgC = st.curva ? gps.filter(p=>p.curva===st.curva) : []
        const lgs = [...new Set(pgC.map(p=>p.largo))].sort((a,b)=>a==='Mix'?1:b==='Mix'?-1:parseInt(a||-1)-parseInt(b||-1))
        const prod = st.largo ? pgC.find(p=>p.largo===st.largo) : null
        const ss = prod ? prod.stock <= 0 : false
        const qty = prod ? cart[prod.id]||0 : 0
        return (
          <div key={gk} className="mb-2 pl-2">
            <p className="text-xs font-semibold text-rosa mb-1.5">· {dim}</p>
            <div className="flex gap-1.5 flex-wrap mb-1.5">
              <span className="text-[10px] text-ink-3 self-center">Curva</span>
              {cvs.map(c => {
                const lbl = c==='custom' ? (gps.find(p=>p.curva==='custom')?.curvaLabel||'Otra') : c
                return <button key={c} onClick={()=>setSel(s=>({...s,[gk]:{curva:st.curva===c?null:c}}))}
                  className={`chip text-xs ${st.curva===c?'chip-active':''}`}>{lbl}</button>
              })}
            </div>
            {st.curva && <div className="flex gap-1.5 flex-wrap mb-1.5">
              <span className="text-[10px] text-ink-3 self-center">Largo</span>
              {lgs.map(l => {
                const lbl = l==='Mix'?'Mix':l==='custom'?(pgC.find(p=>p.largo==='custom')?.largoLabel||'Otro'):l+'mm'
                return <button key={l} onClick={()=>setSel(s=>({...s,[gk]:{...st,largo:st.largo===l?null:l}}))}
                  className={`chip text-xs ${st.largo===l?'chip-active':''}`}>{lbl}</button>
              })}
            </div>}
            {prod && (
              <div className="card flex items-center gap-2 mt-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink leading-tight">{pNom(prod)}</p>
                  <p className="text-xs text-ink-3 mt-0.5">
                    {ss ? 'Sin stock' : `$${prod.precioMenudeo?.toFixed(2)}`}
                    {prod.precioMayoreo > 0 ? ` · May: $${prod.precioMayoreo?.toFixed(2)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {qty > 0 && <>
                    <button onClick={()=>onRem(prod)} className="w-7 h-7 rounded-lg bg-surface-bg text-ink font-bold flex items-center justify-center text-base">−</button>
                    <span className="w-5 text-center font-bold text-sm">{qty}</span>
                  </>}
                  <button onClick={()=>isFav(prod.id)?toggleFav(prod.id):toggleFav(prod.id)}
                    className="text-ink-3 active:text-gold p-1">
                    <span className="text-base">{isFav(prod.id)?'★':'☆'}</span>
                  </button>
                  {ss && onEdit && (
                    <button onClick={()=>onEdit(prod)}
                      className="w-7 h-7 rounded-lg bg-gold-light text-gold flex items-center justify-center font-bold text-sm">+</button>
                  )}
                  <button onClick={()=>onAdd(prod)} disabled={ss || qty >= prod.stock}
                    className="w-8 h-8 rounded-lg bg-rosa text-white flex items-center justify-center disabled:opacity-40">
                    <Plus size={16}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  ))
}


function AbanicoSection({ ps, cart, onAdd, onRem, sel, setSel, isFav, toggleFav, onEdit }) {
  const byDim = {}
  ps.forEach(p=>{ const d=p.dimension==='custom'?p.dimensionLabel||'Otro':p.dimension; if(!byDim[d])byDim[d]=[]; byDim[d].push(p) })
  return Object.keys(byDim).sort(numSort).map(dim=>{
    const gps=byDim[dim], k=`ab_${dim}`, st=sel[k]||{}
    const grs=[...new Set(gps.map(p=>p.grosor))].sort()
    const pg=st.grosor?gps.filter(p=>p.grosor===st.grosor):grs.length===1?gps:[]
    const cvs=[...new Set(pg.map(p=>p.curva))].sort((a,b)=>a==='custom'?1:b==='custom'?-1:a.localeCompare(b))
    const pgC=st.curva?pg.filter(p=>p.curva===st.curva):[]
    const lgs=[...new Set(pgC.map(p=>p.largo))].sort((a,b)=>a==='Mix'?1:b==='Mix'?-1:parseInt(a||-1)-parseInt(b||-1))
    return (
      <div key={dim} className="mb-2">
        <p className="text-xs font-semibold text-ink-2 mb-1.5 pl-1">{dim}</p>
        {grs.length>1&&<div className="flex gap-1.5 flex-wrap mb-1.5">
          <span className="text-[10px] text-ink-3 self-center">Grosor</span>
          {grs.map(g=><button key={g} onClick={()=>setSel(s=>({...s,[k]:{grosor:st.grosor===g?null:g}}))}
            className={`chip text-xs ${st.grosor===g?'chip-active':''}`}>{g}</button>)}
        </div>}
        {(grs.length===1||st.grosor)&&<div className="flex gap-1.5 flex-wrap mb-1.5">
          <span className="text-[10px] text-ink-3 self-center">Curva</span>
          {cvs.map(c=>{
            const lbl=c==='custom'?(pg.find(p=>p.curva==='custom')?.curvaLabel||'Otra'):c
            return <button key={c} onClick={()=>setSel(s=>({...s,[k]:{...st,curva:st.curva===c?null:c,largo:null}}))}
              className={`chip text-xs ${st.curva===c?'chip-active':''}`}>{lbl}</button>
          })}
        </div>}
        {st.curva&&<div className="flex gap-1.5 flex-wrap mb-1.5">
          <span className="text-[10px] text-ink-3 self-center">Largo</span>
          {lgs.map(l=><button key={l} onClick={()=>setSel(s=>({...s,[k]:{...st,largo:st.largo===l?null:l}}))}
            className={`chip text-xs ${st.largo===l?'chip-active':''}`}>{largo(l)}</button>)}
        </div>}
        {st.curva&&st.largo&&pgC.filter(p=>p.largo===st.largo).map(prod=>(
          <ProductRow key={prod.id} prod={prod} qty={cart[prod.id]||0} onAdd={onAdd} onRem={onRem} isFav={isFav(prod.id)} onToggleFav={()=>toggleFav(prod.id)} onEdit={onEdit}/>
        ))}
      </div>
    )
  })
}
