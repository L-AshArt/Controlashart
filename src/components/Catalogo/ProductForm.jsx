import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useToast } from '../Layout/Toast'

const TIPOS = ['clasica','tec','abanico','adhesivo','pinza','insumo','otro']
const TIPO_LABEL = { clasica:'Fibra Clásica', tec:'Fibra Tec', abanico:'Abanico', adhesivo:'Adhesivo', pinza:'Pinza', insumo:'Insumo', otro:'Otro' }
const CURVAS = ['B','C','CC','D','J','L','M','U']
const GROSORES_CL = ['0.03','0.05','0.07','0.10','0.12','0.15','0.18','0.20','0.25']
const LARGOS = ['6','7','8','9','10','11','12','13','14','15','16','17','18','20','Mix']
const DIMS_TEC = ['2D','3D','4D','5D','6D','7D','8D','9D','10D','12D','14D','16D','20D']

export default function ProductForm({ onClose }) {
  const { db, update } = useDB()
  const toast = useToast()

  const [tipo,       setTipo]       = useState('clasica')
  const [marca,      setMarca]      = useState('')
  const [nombre,     setNombre]     = useState('')
  const [grosor,     setGrosor]     = useState('')
  const [dimension,  setDimension]  = useState('')
  const [dimCustom,  setDimCustom]  = useState('')
  const [curva,      setCurva]      = useState('')
  const [curvaLabel, setCurvaLabel] = useState('')
  const [largo,      setLargo]      = useState('')
  const [largoLabel, setLargoLabel] = useState('')
  const [subtipo,    setSubtipo]    = useState('')
  const [notas,      setNotas]      = useState('')
  const [precioM,    setPrecioM]    = useState('')
  const [precioMay,  setPrecioMay]  = useState('')
  const [costo,      setCosto]      = useState('')
  const [stock,      setStock]      = useState('0')
  const [stockB,     setStockB]     = useState('0')

  function save() {
    // Validation
    if (!precioM || parseFloat(precioM) <= 0) { toast('Ingresa el precio de menudeo', 'er'); return }
    if ((tipo==='clasica'||tipo==='tec'||tipo==='abanico') && !curva) { toast('Selecciona la curva', 'er'); return }
    if ((tipo==='adhesivo'||tipo==='pinza'||tipo==='insumo'||tipo==='otro') && !nombre.trim()) { toast('Ingresa el nombre', 'er'); return }

    const id = Date.now()
    const base = {
      id, tipo, notas: notas.trim(),
      precioMenudeo: parseFloat(precioM)||0,
      precioMayoreo: parseFloat(precioMay)||0,
      costo: parseFloat(costo)||0,
      stock: parseInt(stock)||0,
      stockBodega: parseInt(stockB)||0,
    }

    let prod = { ...base }

    if (tipo==='clasica') {
      prod = { ...prod, marca: marca||'Nagaraku', grosor,
        curva: curva==='custom'?'custom':curva,
        curvaLabel: curva==='custom'?curvaLabel:curva,
        largo: largo==='custom'?'custom':largo,
        largoLabel: largo==='custom'?largoLabel:largo,
      }
    } else if (tipo==='tec') {
      prod = { ...prod, marca,
        dimension: dimension==='custom'?'custom':dimension,
        dimensionLabel: dimension==='custom'?dimCustom:dimension,
        curva: curva==='custom'?'custom':curva,
        curvaLabel: curva==='custom'?curvaLabel:curva,
        largo: largo==='custom'?'custom':largo,
        largoLabel: largo==='custom'?largoLabel:largo,
      }
    } else if (tipo==='abanico') {
      prod = { ...prod, marca, grosor,
        dimension: dimension==='custom'?'custom':dimension,
        dimensionLabel: dimension==='custom'?dimCustom:dimension,
        curva: curva==='custom'?'custom':curva,
        curvaLabel: curva==='custom'?curvaLabel:curva,
        largo: largo==='custom'?'custom':largo,
        largoLabel: largo==='custom'?largoLabel:largo,
      }
    } else if (tipo==='adhesivo') {
      prod = { ...prod, marca, nombre: nombre.trim() }
    } else if (tipo==='pinza') {
      prod = { ...prod, marca, subtipo: subtipo.trim()||nombre.trim() }
    } else {
      prod = { ...prod, nombre: nombre.trim() }
    }

    update('prods', ps => [...(ps||[]), prod])
    toast('Producto agregado', 'ok')
    onClose()
  }

  const chip = (val, current, setter, label) => (
    <button key={val} onClick={()=>setter(current===val?'':val)}
      className={`chip text-xs ${current===val?'chip-active':''}`}>
      {label||val}
    </button>
  )

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
              {TIPOS.map(t => chip(t, tipo, setTipo, TIPO_LABEL[t]))}
            </div>
          </div>

          {/* Campos por tipo */}
          {(tipo==='clasica'||tipo==='tec'||tipo==='abanico'||tipo==='adhesivo'||tipo==='pinza') && (
            <div className="card">
              <label className="section-title">Marca</label>
              <input className="input mt-1" placeholder="ej. Nagaraku, DiyDay, IB..." value={marca} onChange={e=>setMarca(e.target.value)}/>
            </div>
          )}

          {(tipo==='adhesivo'||tipo==='insumo'||tipo==='otro') && (
            <div className="card">
              <label className="section-title">Nombre</label>
              <input className="input mt-1" placeholder="Nombre del producto" value={nombre} onChange={e=>setNombre(e.target.value)}/>
            </div>
          )}

          {tipo==='pinza' && (
            <div className="card">
              <label className="section-title">Tipo de pinza</label>
              <input className="input mt-1" placeholder="ej. Recta, Curva, Volumen..." value={subtipo} onChange={e=>setSubtipo(e.target.value)}/>
            </div>
          )}

          {(tipo==='clasica'||tipo==='abanico') && (
            <div className="card">
              <label className="section-title">Grosor</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {GROSORES_CL.map(g => chip(g, grosor, setGrosor))}
                {chip('otro', grosor, g=>setGrosor(g==='otro'?'':g), 'Otro')}
              </div>
              {grosor==='otro' && <input className="input mt-2" placeholder="ej. 0.06" value={grosor==='otro'?'':grosor} onChange={e=>setGrosor(e.target.value)}/>}
            </div>
          )}

          {(tipo==='tec'||tipo==='abanico') && (
            <div className="card">
              <label className="section-title">Dimensión</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {DIMS_TEC.map(d => chip(d, dimension, setDimension))}
                {chip('custom', dimension, setDimension, 'Otra')}
              </div>
              {dimension==='custom' && <input className="input mt-2" placeholder="ej. 15D, 25D..." value={dimCustom} onChange={e=>setDimCustom(e.target.value)}/>}
            </div>
          )}

          {(tipo==='clasica'||tipo==='tec'||tipo==='abanico') && (
            <div className="card">
              <label className="section-title">Curva</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {CURVAS.map(c => chip(c, curva, setCurva))}
                {chip('custom', curva, setCurva, 'Otra')}
              </div>
              {curva==='custom' && <input className="input mt-2" placeholder="ej. CC+" value={curvaLabel} onChange={e=>setCurvaLabel(e.target.value)}/>}
            </div>
          )}

          {(tipo==='clasica'||tipo==='tec'||tipo==='abanico') && (
            <div className="card">
              <label className="section-title">Largo</label>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {LARGOS.map(l => chip(l, largo, setLargo, l==='Mix'?'Mix':l+'mm'))}
                {chip('custom', largo, setLargo, 'Otro')}
              </div>
              {largo==='custom' && <input className="input mt-2" placeholder="ej. 19mm" value={largoLabel} onChange={e=>setLargoLabel(e.target.value)}/>}
            </div>
          )}

          {/* Precios y stock */}
          <div className="card space-y-3">
            <label className="section-title">Precios y stock</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-ink-2 mb-1">Precio menudeo *</p>
                <input type="number" inputMode="decimal" className="input" placeholder="0.00" value={precioM} onChange={e=>setPrecioM(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Precio mayoreo</p>
                <input type="number" inputMode="decimal" className="input" placeholder="0.00" value={precioMay} onChange={e=>setPrecioMay(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Costo</p>
                <input type="number" inputMode="decimal" className="input" placeholder="0.00" value={costo} onChange={e=>setCosto(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Stock tienda</p>
                <input type="number" inputMode="numeric" className="input" placeholder="0" value={stock} onChange={e=>setStock(e.target.value)}/>
              </div>
              <div>
                <p className="text-xs text-ink-2 mb-1">Stock bodega</p>
                <input type="number" inputMode="numeric" className="input" placeholder="0" value={stockB} onChange={e=>setStockB(e.target.value)}/>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="card">
            <label className="section-title">Notas (opcional)</label>
            <input className="input mt-1" placeholder="ej. Cafe, especial, nuevo..." value={notas} onChange={e=>setNotas(e.target.value)}/>
          </div>

          <button onClick={save} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            <Save size={18}/> Guardar producto
          </button>
        </div>
      </div>
    </div>
  )
      }
