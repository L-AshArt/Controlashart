import { useState } from 'react'
import { Shield, Users, Tag, Percent, Gift, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../Layout/Toast'
import Header from '../Layout/Header'

const TIPO_OPTS = [
  { v:'clasica',  l:'Fibra Clasica' },
  { v:'tec',      l:'Fibra Tec'     },
  { v:'abanico',  l:'Abanico'       },
  { v:'adhesivo', l:'Adhesivo'      },
  { v:'pinza',    l:'Pinza'         },
  { v:'insumo',   l:'Insumo'        },
  { v:'otro',     l:'Otro'          },
]

function tipoLabel(v) {
  return TIPO_OPTS.find(o => o.v === v)?.l || v
}

export default function ConfigScreen() {
  const { db, update } = useDB()
  const { changeEmployeePin } = useAuth()
  const toast = useToast()

  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [open, setOpen] = useState('')

  // Cupones
  const [cupCode,  setCupCode]  = useState('')
  const [cupTipo,  setCupTipo]  = useState('pct')
  const [cupValor, setCupValor] = useState('')

  // Promociones
  const [promNombre, setPromNombre] = useState('')
  const [promMin,    setPromMin]    = useState('')
  const [promDesc,   setPromDesc]   = useState('')
  const [promTipo,   setPromTipo]   = useState('pct')

  // Mayoreo
  const [mayTipo,  setMayTipo]  = useState('clasica')
  const [mayMarca, setMayMarca] = useState('')
  const [mayMin,   setMayMin]   = useState('')

  function savePin() {
    if (pin1.length !== 4 || pin1 !== pin2) { toast('Los PINs no coinciden', 'er'); return }
    changeEmployeePin(pin1)
    toast('PIN actualizado', 'ok')
    setPin1(''); setPin2('')
  }

  function addCupon() {
    if (!cupCode.trim() || !parseFloat(cupValor)) { toast('Completa el cupon', 'er'); return }
    const dup = (db.cups || []).find(c => c.code.toLowerCase() === cupCode.trim().toLowerCase())
    if (dup) { toast('Ese codigo ya existe', 'er'); return }
    update('cups', cs => [...(cs || []), {
      id: Date.now(), code: cupCode.trim().toUpperCase(),
      tipo: cupTipo, valor: parseFloat(cupValor), activo: true
    }])
    setCupCode(''); setCupValor('')
    toast('Cupon agregado', 'ok')
  }

  function toggleCupon(id) {
    update('cups', cs => cs.map(c => c.id === id ? { ...c, activo: !c.activo } : c))
  }

  function addPromo() {
    if (!promNombre.trim() || !parseFloat(promMin) || !parseFloat(promDesc)) { toast('Completa la promocion', 'er'); return }
    update('proms', ps => [...(ps || []), {
      id: Date.now(), nombre: promNombre.trim(),
      minCompra: parseFloat(promMin), descuento: parseFloat(promDesc),
      tipo: promTipo, activo: true
    }])
    setPromNombre(''); setPromMin(''); setPromDesc('')
    toast('Promocion agregada', 'ok')
  }

  function togglePromo(id) {
    update('proms', ps => ps.map(p => p.id === id ? { ...p, activo: !p.activo } : p))
  }

  function addMayoreo() {
    if (!parseFloat(mayMin)) { toast('Ingresa el minimo de piezas', 'er'); return }
    const marca = mayMarca || 'todas'
    const dup = (db.mayoreo || []).find(r => r.tipo === mayTipo && r.marca === marca)
    if (dup) { toast('Ya existe una regla para esa categoria', 'er'); return }
    update('mayoreo', rs => [...(rs || []), {
      id: Date.now(), tipo: mayTipo, marca, minPiezas: parseInt(mayMin)
    }])
    setMayMarca(''); setMayMin('')
    toast('Regla agregada', 'ok')
  }

  const marcasParaTipo = [...new Set(
    (db.prods || [])
      .filter(p => (p.tipo || 'otro') === mayTipo)
      .map(p => p.marca || (mayTipo === 'clasica' ? 'Nagaraku' : 'Sin marca'))
  )].sort()

  function Sec({ id, icon: Icon, title, sub, color, children }) {
    const isOpen = open === id
    return (
      <div className="card overflow-hidden">
        <button className="w-full flex items-center gap-3" onClick={() => setOpen(isOpen ? '' : id)}>
          <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + color}>
            <Icon size={18}/>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-ink">{title}</p>
            {sub && <p className="text-xs text-ink-3">{sub}</p>}
          </div>
          {isOpen
            ? <ChevronUp size={16} className="text-ink-3"/>
            : <ChevronDown size={16} className="text-ink-3"/>
          }
        </button>
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <Header title="Configuracion"/>
      <div className="px-4 py-4 space-y-3">

        <div className="card text-center py-4">
          <div className="w-16 h-16 rounded-full bg-rosa mx-auto flex items-center justify-center mb-3 overflow-hidden">
            <img src="/Controlashart/icon-180.png" alt="logo" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }}/>
          </div>
          <h2 className="font-serif text-xl font-bold text-ink">L-Ash Art</h2>
          <p className="text-[10px] font-mono bg-surface-bg px-2 py-1 rounded mt-1 text-ink-3">
            {window.APP_VERSION || 'v1.2.0'}
          </p>
        </div>

        <Sec id="pin" icon={Users} title="PIN de Empleada" sub="Acceso con funciones limitadas" color="bg-blue-50 text-blue-500">
          <input className="input" type="password" inputMode="numeric" maxLength={4}
            placeholder="Nuevo PIN (4 digitos)" value={pin1} onChange={e => setPin1(e.target.value)}/>
          <input className="input" type="password" inputMode="numeric" maxLength={4}
            placeholder="Confirmar PIN" value={pin2} onChange={e => setPin2(e.target.value)}/>
          <button onClick={savePin} className="btn-primary w-full">Guardar PIN</button>
        </Sec>

        <Sec id="cups" icon={Tag}
          title="Cupones de descuento"
          sub={(db.cups || []).length + ' cupon(es)'}
          color="bg-ok-light text-ok">
          <input className="input" placeholder="Codigo (ej. BIENVENIDA10)"
            value={cupCode} onChange={e => setCupCode(e.target.value.toUpperCase())}/>
          <div className="flex gap-2">
            <select className="input flex-1" value={cupTipo} onChange={e => setCupTipo(e.target.value)}>
              <option value="pct">Porcentaje %</option>
              <option value="fijo">Monto fijo $</option>
            </select>
            <input type="number" inputMode="decimal" className="input flex-1"
              placeholder={cupTipo === 'pct' ? 'Ej. 10' : 'Ej. 50'}
              value={cupValor} onChange={e => setCupValor(e.target.value)}/>
          </div>
          <button onClick={addCupon} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            <Plus size={16}/> Agregar cupon
          </button>
          {(db.cups || []).map(c => (
            <div key={c.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (c.activo ? 'bg-ok-light text-ok' : 'bg-gray-100 text-ink-3')}>
                  {c.code}
                </span>
                <span className="text-xs text-ink-2">{c.tipo === 'pct' ? '-' + c.valor + '%' : '-$' + c.valor}</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => toggleCupon(c.id)}
                  className={'text-xs font-bold px-2 py-1 rounded-lg ' + (c.activo ? 'bg-ok-light text-ok' : 'bg-gray-100 text-ink-3')}>
                  {c.activo ? 'Activo' : 'Inactivo'}
                </button>
                <button onClick={() => update('cups', cs => cs.filter(x => x.id !== c.id))}
                  className="w-7 h-7 rounded-lg bg-danger-light text-danger flex items-center justify-center">
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>
          ))}
        </Sec>

        <Sec id="proms" icon={Gift}
          title="Promociones automaticas"
          sub={(db.proms || []).length + ' promo(s)'}
          color="bg-gold-light text-gold">
          <p className="text-xs text-ink-3">Se aplican cuando el total supera el monto minimo.</p>
          <input className="input" placeholder="Nombre (ej. Descuento mayoreo)"
            value={promNombre} onChange={e => setPromNombre(e.target.value)}/>
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs text-ink-3 mb-1">Compra minima $</p>
              <input type="number" inputMode="decimal" className="input"
                placeholder="500" value={promMin} onChange={e => setPromMin(e.target.value)}/>
            </div>
            <div className="flex-1">
              <p className="text-xs text-ink-3 mb-1">Descuento</p>
              <div className="flex gap-1">
                <select className="input w-14 text-xs px-1" value={promTipo} onChange={e => setPromTipo(e.target.value)}>
                  <option value="pct">%</option>
                  <option value="fijo">$</option>
                </select>
                <input type="number" inputMode="decimal" className="input flex-1"
                  placeholder="10" value={promDesc} onChange={e => setPromDesc(e.target.value)}/>
              </div>
            </div>
          </div>
          <button onClick={addPromo} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            <Plus size={16}/> Agregar promocion
          </button>
          {(db.proms || []).map(p => (
            <div key={p.id} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink truncate">{p.nombre}</p>
                <p className="text-xs text-ink-3">
                  Min. ${p.minCompra} {'→'} {p.tipo === 'pct' ? '-' + p.descuento + '%' : '-$' + p.descuento}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => togglePromo(p.id)}
                  className={'text-xs font-bold px-2 py-1 rounded-lg ' + (p.activo ? 'bg-ok-light text-ok' : 'bg-gray-100 text-ink-3')}>
                  {p.activo ? 'Activa' : 'Inactiva'}
                </button>
                <button onClick={() => update('proms', ps => ps.filter(x => x.id !== p.id))}
                  className="w-7 h-7 rounded-lg bg-danger-light text-danger flex items-center justify-center">
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>
          ))}
        </Sec>

        <Sec id="mayo" icon={Percent}
          title="Reglas de mayoreo"
          sub={(db.mayoreo || []).length + ' regla(s)'}
          color="bg-rosa/10 text-rosa">
          <p className="text-xs text-ink-3">
            Define cuantas piezas por categoria activan el precio mayoreo.
          </p>
          <div>
            <p className="text-xs text-ink-2 mb-1">Tipo de producto</p>
            <select className="input" value={mayTipo} onChange={e => { setMayTipo(e.target.value); setMayMarca('') }}>
              {TIPO_OPTS.map(o => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-ink-2 mb-1">Marca (vacio = todas)</p>
            <select className="input" value={mayMarca} onChange={e => setMayMarca(e.target.value)}>
              <option value="">Todas las marcas</option>
              {marcasParaTipo.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-ink-2 mb-1">Minimo de piezas para mayoreo</p>
            <input type="number" inputMode="numeric" className="input"
              placeholder="ej. 5" value={mayMin} onChange={e => setMayMin(e.target.value)}/>
          </div>
          <button onClick={addMayoreo} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            <Plus size={16}/> Agregar regla
          </button>
          {(db.mayoreo || []).map(r => (
            <div key={r.id} className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-bold text-ink">{tipoLabel(r.tipo)}</p>
                <p className="text-xs text-ink-3">
                  {r.marca === 'todas' ? 'Todas las marcas' : r.marca} · min. {r.minPiezas} pzas
                </p>
              </div>
              <button onClick={() => update('mayoreo', rs => rs.filter(x => x.id !== r.id))}
                className="w-7 h-7 rounded-lg bg-danger-light text-danger flex items-center justify-center">
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </Sec>

        <Sec id="seg" icon={Shield} title="Seguridad" sub="PIN de duena: configurado" color="bg-ok-light text-ok">
          <p className="text-xs text-ink-3">El PIN de duena esta protegido. Para cambiarlo contacta al desarrollador.</p>
        </Sec>

      </div>
    </div>
  )
}
