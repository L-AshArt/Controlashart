import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useToast } from '../Layout/Toast'

const TIPOS    = ['clasica','tec','abanico','adhesivo','pinza','insumo','otro']
const TLABELS  = {clasica:'Fibra Clásica',tec:'Fibra Tec',abanico:'Abanico',adhesivo:'Adhesivo',pinza:'Pinza',insumo:'Insumo',otro:'Otro'}
const CURVAS   = ['B','C','CC','D','J','L','M','U']
const GROSORES = ['0.03','0.05','0.07','0.10','0.12','0.15','0.18','0.20','0.25']
const LARGOS   = ['6','7','8','9','10','11','12','13','14','15','16','17','18','20','Mix']
const DIMS     = ['2D','3D','4D','5D','6D','7D','8D','9D','10D','12D','14D','16D','20D']

export default function ProductForm({ onClose }) {
  const { update } = useDB()
  const toast = useToast()

  const [tipo,       setTipo]       = useState('clasica')
  const [marca,      setMarca]      = useState('')
  const [nombre,     setNombre]     = useState('')
  const [grosor,     setGrosor]     = useState('')
  const [dimension,  setDimension]  = useState('')
  const [dimCustom,  setDimCustom]  = useState('')
  const [curva,      setCurva]      = useState('')
  const [curvaLabel, setCurvaLabel] = useState('')
  const [largos,     setLargos]     = useState([])
  const [largoLabel, setLargoLabel] = useState('')
  const [subtipo,    setSubtipo]    = useState('')
  const [notas,      setNotas]      = useState('')
  const [precioM,    setPrecioM]    = useState('')
  const [precioMay,  setPrecioMay]  = useState('')
  const [costo,      setCosto]      = useState('')
  const [stock,      setStock]      = useState('0')
  const [stockB,     setStockB]     = useState('0')

  const hasFiber = tipo==='clasica' || tipo==='tec' || tipo==='abanico'

  function toggleLargo(l) {
    setLargos(prev => prev.includes(l) ? prev.filter(x=>x!==l) : [...prev, l])
  }

  function save() {
    if (!precioM || parseFloat(precioM) <= 0) { toast('Ingresa el precio de menudeo','er'); return }
    if (hasFiber && !curva)          { toast('Selecciona la curva','er'); return }
    if (hasFiber && largos.length===0) { toast('Selecciona al menos un largo','er'); return }
    if (!hasFiber && !nombre.trim()) { toast('Ingresa el nombre','er'); return }

    const base = {
      tipo,
      notas:         notas.trim(),
      precioMenudeo: parseFloat(precioM) || 0,
      precioMayoreo: parseFloat(precioMay) || 0,
      costo:         parseFloat(costo) || 0,
      stock:         parseInt(stock) || 0,
      stockBodega:   parseInt(stockB) || 0,
    }

    let extras = {}
    if (tipo === 'clasica') {
      extras = {
        marca: marca || 'Nagaraku',
        grosor,
        curva: curva === 'custom' ? 'custom' : curva,
        curvaLabel: curva === 'custom' ? curvaLabel : curva,
      }
    } else if (tipo === 'tec') {
      extras = {
        marca,
        dimension: dimension === 'custom' ? 'custom' : dimension,
        dimensionLabel: dimension === 'custom' ? dimCustom : dimension,
        curva: curva === 'custom' ? 'custom' : curva,
        curvaLabel: curva === 'custom' ? curvaLabel : curva,
      }
    } else if (tipo === 'abanico') {
      extras = {
        marca,
        grosor,
        dimension: dimension === 'custom' ? 'custom' : dimension,
        dimensionLabel: dimension === 'custom' ? dimCustom : dimension,
        curva: curva === 'custom' ? 'custom' : curva,
        curvaLabel: curva === 'custom' ? curvaLabel : curva,
      }
    } else if (tipo === 'adhesivo') {
      extras = { marca, nombre: nombre.trim() }
    } else if (tipo === 'pinza') {
      extras = { marca, subtipo: subtipo.trim() || nombre.trim() }
    } else {
      extras = { nombre: nombre.trim() }
    }

    const newProds = hasFiber
      ? largos.map((l, i) => ({
          ...base, ...extras,
          id: Date.now() + i,
          largo: l === 'custom' ? 'custom' : l,
          largoLabel: l === 'custom' ? largoLabel : l,
        }))
      : [{ ...base, ...extras, id: Date.now() }]

    update('prods', ps => [...(ps || []), ...newProds])
    toast(newProds.length > 1 ? `${newProds.length} productos agregados` : 'Producto agregado', 'ok')
    onClose()
  }

  function Chip({ val, active, onPress, label }) {
    return (
      <button onClick={onPress}
        className={`chip text-xs ${active ? 'chip-active' : ''}`}>
        {label || val}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-base font-bold text-ink">Agregar producto</h3>
          <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Tipo */}
          <div className="card">
            <label className="section-title">Tipo</label>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {TIPOS.map(t => (
                <Chip key={t} val={t} active={tipo===t} onPress={()=>setTipo(t)} label={TLABELS[t]}/>
              ))}
            </div>
          </div>

          {/* Marca */}
          {(hasFiber || tipo==='adhesivo' || tipo==='pinza') && (
            <div className="card">
              <label className="section-title">Marca</label>
              <input className="input mt-1" placeholder="ej. Nagaraku, DiyDay, IB..."
                value={marca} onChange={e=>setMarca(e.target.value)}/>
            </div>
          )}

          {/* Nombre */}
          {(tipo==='adhesivo'||tipo==='insumo'||tipo==='otro') && (
            <div className="card">
              <label className="section-title">Nombre</label>
              <input className="input mt-1" placeholder="Nombre del producto"
                value={nombre} onChange={e=>setNombre(e.target.value)}/>
            </div>
          )}

          {/* Subtipo pinza */}
          {tipo==='pinza' && (
            <div className="card">
              <label className="section-title">Tipo de pinza</label>
              <input className="input mt-1" placeholder="ej. Recta, Curva, Volumen..."
                value={subtipo} onChange={e=>setSubtipo(e.target.value)}/>
            </div>
          )}

          {/* Grosor */}
          {(tipo==='clasica'||tipo==='abanico') && (
            <div className="card">
              <label className="section-title">Grosor</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {GROSORES.map(g => <Chip key={g} val={g} active={grosor===g} onPress={()=>setGrosor(g===grosor?'':g)}/>)}
              </div>
            </div>
          )}

          {/* Dimensión */}
          {(tipo==='tec'||tipo==='abanico') && (
            <div className="card">
              <label className="section-title">Dimensión</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {DIMS.map(d => <Chip key={d} val={d} active={dimension===d} onPress={()=>setDimension(d===dimension?'':d)}/>)}
                <Chip val="custom" active={dimension==='custom'} onPress={()=>setDimension(dimension==='custom'?'':'custom')} label="Otra"/>
              </div>
              {dimension==='custom' && (
                <input className="input mt-2" placeholder="ej. 15D, 25D..."
                  value={dimCustom} onChange={e=>setDimCustom(e.target.value)}/>
              )}
            </div>
          )}

          {/* Curva */}
          {hasFiber && (
            <div className="card">
              <label className="section-title">Curva</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {CURVAS.map(c => <Chip key={c} val={c} active={curva===c} onPress={()=>setCurva(c===curva?'':c)}/>)}
                <Chip val="custom" active={curva==='custom'} onPress={()=>setCurva(curva==='custom'?'':'custom')} label="Otra"/>
              </div>
              {curva==='custom' && (
                <input className="input mt-2" placeholder="ej. CC+"
                  value={curvaLabel} onChange={e=>setCurvaLabel(e.target.value)}/>
              )}
            </div>
          )}

          {/* Largos — MULTI SELECT */}
          {hasFiber && (
            <div className="card">
              <label className="section-title">
                Largos{' '}
                {largos.length > 0 && (
                  <span className="text-rosa font-bold normal-case">
                    ({largos.length} seleccionado{largos.length!==1?'s':''})
                  </span>
                )}
              </label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {LARGOS.map(l => (
                  <Chip key={l} val={l} active={largos.includes(l)} onPress={()=>toggleLargo(l)}
                    label={l==='Mix'?'Mix':l+'mm'}/>
                ))}
                <Chip val="custom" active={largos.includes('custom')} onPress={()=>toggleLargo('custom')} label="Otro"/>
              </div>
              {largos.includes('custom') && (
                <input className="input mt-2" placeholder="ej. 19mm"
                  value={largoLabel} onChange={e=>setLargoLabel(e.target.value)}/>
              )}
              {largos.length > 1 && (
                <p className="text-xs text-ok mt-2">
                  Se crearán {largos.length} productos con el mismo precio
                </p>
              )}
            </div>
          )}

          {/* Precios y stock */}
          <div className="card space-y-3">
            <label className="section-title">Precios y stock</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-ink-2 mb-1">Precio menudeo *</p>
                <input type="number" inputMode="decimal" className="input" placeholder="0.00"
                  value={precioM} onChange={e=>setPrecioM(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Precio mayoreo</p>
                <input type="number" inputMode="decimal" className="input" placeholder="0.00"
                  value={precioMay} onChange={e=>setPrecioMay(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Costo</p>
                <input type="number" inputMode="decimal" className="input" placeholder="0.00"
                  value={costo} onChange={e=>setCosto(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Stock tienda</p>
                <input type="number" inputMode="numeric" className="input" placeholder="0"
                  value={stock} onChange={e=>setStock(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Stock bodega</p>
                <input type="number" inputMode="numeric" className="input" placeholder="0"
                  value={stockB} onChange={e=>setStockB(e.target.value)}/>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="card">
            <label className="section-title">Notas (opcional)</label>
            <input className="input mt-1" placeholder="ej. Cafe, especial, nuevo..."
              value={notas} onChange={e=>setNotas(e.target.value)}/>
          </div>

          <button onClick={save} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            <Save size={18}/>
            {hasFiber && largos.length > 1
              ? `Guardar ${largos.length} productos`
              : 'Guardar producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
