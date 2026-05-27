import { useState, useMemo } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Receipt, Trash2 } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useAuth } from '../../context/AuthContext'
import { parseFecha } from '../../utils/products'
import Header from '../Layout/Header'
import VentaDetailModal from './VentaDetailModal'

const PERIODS = [
  { id:'hoy',    label:'Hoy'    },
  { id:'semana', label:'Semana' },
  { id:'mes',    label:'Mes'    },
]

export default function ReportesScreen() {
  const { db, update } = useDB()
  const { isAdmin } = useAuth()
  const [period, setPeriod]       = useState('hoy')
  const [showGastos, setShowGastos] = useState(false)
  const [gDesc, setGDesc]         = useState('')
  const [gMonto, setGMonto]       = useState('')
  const [detalle, setDetalle]     = useState(null)

  const hoy = new Date().toLocaleDateString('es-MX')

  const ventas = useMemo(() => {
    if (!db.ventas) return []
    return db.ventas.filter(v => {
      const d = parseFecha(v.fecha)
      const now = new Date()
      if (period === 'hoy') return v.fecha === hoy
      if (period === 'semana') { const s=new Date(Date.now()-6*86400000);s.setHours(0,0,0,0);return d>=s }
      return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()
    })
  }, [db.ventas, period, hoy])

  const gastosPer = useMemo(() => {
    if (!db.gastos) return []
    return db.gastos.filter(g => {
      const d = parseFecha(g.fecha)
      const now = new Date()
      if (period === 'hoy') return g.fecha === hoy
      if (period === 'semana') { const s=new Date(Date.now()-6*86400000);s.setHours(0,0,0,0);return d>=s }
      return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()
    })
  }, [db.gastos, period, hoy])

  const tot        = ventas.reduce((s,v)=>s+v.tot,0)
  const totGastos  = gastosPer.reduce((s,g)=>s+g.monto,0)
  const neto       = tot - totGastos
  const ticketProm = ventas.length ? tot/ventas.length : 0

  const gan = useMemo(() => {
    let g = 0
    ventas.forEach(v => v.items?.forEach(it => { if(it.costo>0) g+=(it.precio-it.costo)*it.qty }))
    return g
  }, [ventas])

  function addGasto() {
    if (!gDesc.trim() || !parseFloat(gMonto)) return
    const hora = new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})
    update('gastos', gs=>[...(gs||[]),{id:Date.now(),fecha:hoy,hora,desc:gDesc.trim(),monto:parseFloat(gMonto)}])
    setGDesc(''); setGMonto('')
  }

  const stockData = useMemo(() => {
    const prods = db.prods || []
    return {
      ok:  prods.filter(p=>p.stock>5).length,
      low: prods.filter(p=>p.stock>0&&p.stock<=5).length,
      out: prods.filter(p=>p.stock<=0).length,
      total: prods.length,
    }
  }, [db.prods])

  const sp = (n) => stockData.total ? Math.round(n/stockData.total*100) : 0

  return (
    <div>
      <Header title="Reportes" right={
        <button onClick={()=>setShowGastos(!showGastos)}
          className="px-3 py-1.5 rounded-lg bg-danger-light text-danger text-xs font-bold border border-red-200">
          + Gastos
        </button>
      }/>

      <div className="px-4 py-4 space-y-4">
        {/* Period */}
        <div className="flex bg-white rounded-xl p-1 gap-1 shadow-card">
          {PERIODS.map(({id,label})=>(
            <button key={id} onClick={()=>setPeriod(id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${period===id?'bg-rosa text-white shadow-sm':'text-ink-2'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Gastos form */}
        {showGastos && (
          <div className="card space-y-3">
            <p className="font-bold text-sm text-ink">Registrar gasto</p>
            <input className="input" placeholder="Descripcion (renta, material...)" value={gDesc} onChange={e=>setGDesc(e.target.value)}/>
            <input className="input text-xl font-bold text-center" type="number" inputMode="decimal" placeholder="$0.00" value={gMonto} onChange={e=>setGMonto(e.target.value)}/>
            <button onClick={addGasto} className="btn-danger w-full text-sm">Registrar gasto</button>
            {gastosPer.length>0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {gastosPer.map(g=>(
                  <div key={g.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-ink">{g.desc}</p>
                      <p className="text-xs text-ink-3">{g.hora}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-danger">-${g.monto.toFixed(2)}</span>
                      <button onClick={()=>update('gastos',gs=>gs.filter(x=>x.id!==g.id))} className="text-ink-3"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KPI label="Ingresos" value={'$'+tot.toFixed(2)} Icon={DollarSign}/>
          <KPI label="Ventas" value={ventas.length} Icon={ShoppingCart}/>
          <KPI label="Ticket prom." value={'$'+ticketProm.toFixed(0)} Icon={Receipt}/>
          {isAdmin&&gan>0&&<KPI label="Ganancia est." value={'$'+gan.toFixed(2)} Icon={TrendingUp} color="text-ok" bg="bg-ok-light"/>}
          {totGastos>0&&<KPI label="Gastos" value={'-$'+totGastos.toFixed(2)} Icon={Receipt} color="text-danger" bg="bg-danger-light"/>}
          {totGastos>0&&<KPI label="Neto" value={'$'+neto.toFixed(2)} Icon={DollarSign} color={neto>=0?'text-ok':'text-danger'} bg={neto>=0?'bg-ok-light':'bg-danger-light'} colSpan/>}
        </div>

        {/* Stock donut */}
        <div className="card">
          <p className="font-bold text-sm text-ink mb-3">Stock de tienda</p>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F4F5F7" strokeWidth="3.8"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="3.8"
                  strokeDasharray={sp(stockData.out)+' '+(100-sp(stockData.out))}/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#B8952A" strokeWidth="3.8"
                  strokeDasharray={sp(stockData.low)+' '+(100-sp(stockData.low))}
                  strokeDashoffset={-sp(stockData.out)}/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.8"
                  strokeDasharray={sp(stockData.ok)+' '+(100-sp(stockData.ok))}
                  strokeDashoffset={-(sp(stockData.out)+sp(stockData.low))}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-ink">{stockData.total}</span>
                <span className="text-[9px] text-ink-3">total</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <StockRow color="bg-ok"     label="Disponibles"  n={stockData.ok}/>
              <StockRow color="bg-gold"   label="Stock minimo" n={stockData.low}/>
              <StockRow color="bg-danger" label="Agotados"     n={stockData.out}/>
            </div>
          </div>
        </div>

        {/* Ventas list */}
        <div className="card">
          <p className="font-bold text-sm text-ink mb-3">Ventas del periodo</p>
          {ventas.length===0
            ? <p className="text-center text-ink-3 text-sm py-4">Sin ventas</p>
            : <div className="space-y-1">
                {[...ventas].reverse().slice(0,30).map(v=>(
                  <button key={v.num} onClick={()=>setDetalle(v)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-bg transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-ink">Venta #{v.num}</p>
                      <p className="text-xs text-ink-3">{v.fecha} · {v.hora} · {v.items?.length} prod.</p>
                    </div>
                    <span className="font-bold text-ink">${v.tot.toFixed(2)}</span>
                  </button>
                ))}
              </div>
          }
        </div>
      </div>

      {detalle && <VentaDetailModal venta={detalle} onClose={()=>setDetalle(null)}/>}
    </div>
  )
}

function KPI({ label, value, Icon, color='text-ink', bg='bg-white', colSpan=false }) {
  return (
    <div className={`${bg} rounded-xl2 shadow-card p-4 ${colSpan?'col-span-2':''}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color}/>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function StockRow({ color, label, n }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`}/>
        <span className="text-ink-2">{label}</span>
      </div>
      <span className="font-bold">{n}</span>
    </div>
  )
}
