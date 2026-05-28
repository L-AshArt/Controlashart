import { useState, useMemo } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Receipt, Plus, Trash2, FileDown } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useAuth } from '../../context/AuthContext'
import { parseFecha } from '../../utils/products'
import Header from '../Layout/Header'

const PERIODS = [
  { id: 'hoy',    label: 'Hoy'    },
  { id: 'semana', label: 'Semana' },
  { id: 'mes',    label: 'Mes'    },
]

export default function ReportesScreen() {
  const { db, update } = useDB()
  const { isAdmin } = useAuth()
  const toast = useToast()
  const [period, setPeriod] = useState('hoy')
  const [showGastos, setShowGastos] = useState(false)
  const [gDesc, setGDesc] = useState('')
  const [gMonto, setGMonto] = useState('')

  const hoy = new Date().toLocaleDateString('es-MX')

  const ventas = useMemo(() => {
    if (!db.ventas) return []
    return db.ventas.filter(v => {
      const d = parseFecha(v.fecha)
      const now = new Date()
      if (period === 'hoy') return v.fecha === hoy
      if (period === 'semana') {
        const s = new Date(Date.now() - 6*86400000); s.setHours(0,0,0,0)
        return d >= s
      }
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
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

  const tot         = ventas.reduce((s,v)=>s+v.tot,0)
  const totGastos   = gastosPer.reduce((s,g)=>s+g.monto,0)
  const neto        = tot - totGastos
  const ticketProm  = ventas.length ? tot/ventas.length : 0

  // Ganancia estimada
  const gan = useMemo(() => {
    let g = 0
    ventas.forEach(v => v.items?.forEach(it => {
      if (it.costo > 0) g += (it.precio - it.costo) * it.qty
    }))
    return g
  }, [ventas])

  function addGasto() {
    if (!gDesc.trim() || !parseFloat(gMonto)) return
    const hora = new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})
    update('gastos', gs => [...(gs||[]), { id: Date.now(), fecha: hoy, hora, desc: gDesc.trim(), monto: parseFloat(gMonto) }])
    setGDesc(''); setGMonto('')
  }

  // Stock distribution
  const stockData = useMemo(() => {
    const prods = db.prods || []
    const ok = prods.filter(p=>p.stock>5).length
    const low = prods.filter(p=>p.stock>0&&p.stock<=5).length
    const out = prods.filter(p=>p.stock<=0).length
    return { ok, low, out, total: prods.length }
  }, [db.prods])

  const stockPct = (n) => stockData.total ? Math.round(n/stockData.total*100) : 0


  async function generarPDF() {
    if (typeof window.jspdf === 'undefined') { toast('Cargando...', 'in'); return }
    const J = window.jspdf.jsPDF
    const doc = new J({ unit: 'mm', format: 'a4' })
    const pw = 210, lm = 15, rw = 180, cx = pw / 2
    let y = 15

    // Logo
    const LOGO = "data:image/png;base64,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"
    try { doc.addImage(LOGO, 'PNG', cx - 10, y, 20, 20, undefined, 'FAST') } catch(e) {}
    y += 24

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(196, 121, 138)
    doc.text('L-Ash Art', cx, y, { align: 'center' })
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(107, 107, 123)
    const periodoLabel = period === 'hoy' ? 'Reporte del día' : period === 'semana' ? 'Reporte semanal' : 'Reporte mensual'
    doc.text(periodoLabel, cx, y, { align: 'center' })
    y += 4
    doc.text(new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), cx, y, { align: 'center' })
    y += 8

    // Divider
    doc.setDrawColor(220, 200, 210)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(lm, y, lm + rw, y)
    y += 7

    // KPIs
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(28, 28, 46)
    doc.text('Resumen', lm, y)
    y += 6

    const kpis = [
      ['Total ingresos', '$' + tot.toFixed(2)],
      ['Número de ventas', String(ventas.length)],
      ['Ticket promedio', '$' + ticketProm.toFixed(2)],
    ]
    if (totGastos > 0) kpis.push(['Gastos', '-$' + totGastos.toFixed(2)])
    if (totGastos > 0) kpis.push(['Neto', '$' + neto.toFixed(2)])

    doc.setFontSize(10)
    kpis.forEach(([label, val]) => {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 107, 123)
      doc.text(label, lm, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(28, 28, 46)
      doc.text(val, lm + rw, y, { align: 'right' })
      y += 6
    })
    y += 4

    // Products sold section (for restocking)
    if (period === 'hoy' || ventas.length > 0) {
      doc.setLineDashPattern([1, 1], 0)
      doc.setDrawColor(220, 200, 210)
      doc.line(lm, y, lm + rw, y)
      y += 7

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(28, 28, 46)
      doc.text(period === 'hoy' ? 'Productos vendidos hoy (para reposición)' : 'Productos vendidos', lm, y)
      y += 6

      // Aggregate products sold
      const soldMap = {}
      ventas.forEach(v => {
        (v.items || []).forEach(it => {
          const key = it.nombre
          if (!soldMap[key]) soldMap[key] = { nombre: it.nombre, qty: 0, total: 0 }
          soldMap[key].qty += it.qty
          soldMap[key].total += it.precio * it.qty
        })
      })

      const soldList = Object.values(soldMap).sort((a, b) => b.qty - a.qty)

      if (soldList.length === 0) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(107, 107, 123)
        doc.text('Sin ventas en este período', cx, y, { align: 'center' })
        y += 6
      } else {
        // Header row
        doc.setFillColor(250, 240, 242)
        doc.rect(lm, y - 3, rw, 6, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(107, 107, 123)
        doc.text('Producto', lm + 2, y + 1)
        doc.text('Cant.', lm + 115, y + 1, { align: 'right' })
        doc.text('Total', lm + rw, y + 1, { align: 'right' })
        y += 7

        soldList.forEach(item => {
          if (y > 270) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(item.nombre, 110)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(28, 28, 46)
          doc.text(lines[0], lm + 2, y)
          doc.setFont('helvetica', 'bold')
          doc.text(String(item.qty), lm + 115, y, { align: 'right' })
          doc.setTextColor(196, 121, 138)
          doc.text('$' + item.total.toFixed(2), lm + rw, y, { align: 'right' })
          doc.setDrawColor(240, 235, 240)
          doc.setLineDashPattern([], 0)
          doc.line(lm, y + 1.5, lm + rw, y + 1.5)
          y += lines.length > 1 ? 5 * lines.length : 5
        })

        // Total row
        y += 2
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(28, 28, 46)
        doc.text('Total unidades vendidas', lm + 2, y)
        doc.text(String(soldList.reduce((s, i) => s + i.qty, 0)), lm + 115, y, { align: 'right' })
        y += 8
      }
    }

    // Sales detail
    if (ventas.length > 0) {
      if (y > 240) { doc.addPage(); y = 20 }
      doc.setLineDashPattern([1, 1], 0)
      doc.setDrawColor(220, 200, 210)
      doc.line(lm, y, lm + rw, y)
      y += 7

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(28, 28, 46)
      doc.text('Detalle de ventas', lm, y)
      y += 6

      ventas.forEach(v => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(28, 28, 46)
        doc.text('#' + v.num + ' — ' + v.fecha + ' ' + v.hora, lm + 2, y)
        doc.text('$' + v.tot.toFixed(2), lm + rw, y, { align: 'right' })
        y += 4.5
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(107, 107, 123)
        const metodo = v.metodo === 'efectivo' ? 'Efectivo' : v.metodo === 'tarjeta' ? 'Tarjeta' : 'Transferencia'
        doc.text(metodo + ' · ' + (v.items || []).length + ' producto(s)', lm + 4, y)
        y += 5
      })
    }

    // Footer
    y += 4
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(196, 121, 138)
    doc.text('L-Ash Art © ' + new Date().getFullYear() + ' · Generado el ' + new Date().toLocaleString('es-MX'), cx, y, { align: 'center' })

    doc.save('reporte-' + period + '-' + new Date().toLocaleDateString('es-MX').replace(/\//g,'-') + '.pdf')
  }

  return (
    <div>
      <Header
        title="Reportes"
        right={
          <div className="flex gap-2">
            <button onClick={()=>setShowGastos(!showGastos)}
              className="px-3 py-1.5 rounded-lg bg-danger-light text-danger text-xs font-bold border border-red-200">
              + Gastos
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Period selector */}
        <div className="flex bg-white rounded-xl p-1 gap-1 shadow-card">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                period===id ? 'bg-rosa text-white shadow-sm' : 'text-ink-2'
              }`}
            >{label}</button>
          ))}
        </div>

        {/* Gastos form */}
        {showGastos && (
          <div className="card space-y-3">
            <p className="font-bold text-sm text-ink">Registrar gasto</p>
            <input className="input" placeholder="Descripción (renta, material...)" value={gDesc} onChange={e=>setGDesc(e.target.value)} />
            <input className="input text-xl font-bold text-center" type="number" inputMode="decimal" placeholder="$0.00" value={gMonto} onChange={e=>setGMonto(e.target.value)} />
            <button onClick={addGasto} className="btn-danger w-full text-sm">Registrar gasto</button>
            {gastosPer.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {gastosPer.map(g => (
                  <div key={g.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-ink">{g.desc}</p>
                      <p className="text-xs text-ink-3">{g.hora}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-danger">-${g.monto.toFixed(2)}</span>
                      <button onClick={()=>update('gastos',gs=>gs.filter(x=>x.id!==g.id))}
                        className="text-ink-3"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          <KPI label="Total ingresos" value={`$${tot.toFixed(2)}`} Icon={DollarSign} color="text-ink" />
          <KPI label="Ventas" value={ventas.length} Icon={ShoppingCart} color="text-ink" />
          <KPI label="Ticket promedio" value={`$${ticketProm.toFixed(0)}`} Icon={Receipt} color="text-ink" />
          {isAdmin && gan>0 && <KPI label="Ganancia est." value={`$${gan.toFixed(2)}`} Icon={TrendingUp} color="text-ok" bg="bg-ok-light" />}
          {isAdmin && gan>0 && tot>0 && <KPI label="Margen" value={`${(gan/tot*100).toFixed(1)}%`} Icon={TrendingUp} color="text-ok" bg="bg-ok-light" />}
          {totGastos>0 && <KPI label="Gastos" value={`-$${totGastos.toFixed(2)}`} Icon={Receipt} color="text-danger" bg="bg-danger-light" />}
          {totGastos>0 && <KPI label="Neto" value={`$${neto.toFixed(2)}`} Icon={DollarSign} color={neto>=0?'text-ok':'text-danger'} bg={neto>=0?'bg-ok-light':'bg-danger-light'} colSpan />}
        </div>

        {/* Stock chart */}
        <div className="card">
          <p className="font-bold text-sm text-ink mb-3">📊 Stock de tienda</p>
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F4F5F7" strokeWidth="3.8"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="3.8"
                  strokeDasharray={`${stockPct(stockData.out)} ${100-stockPct(stockData.out)}`}/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#B8952A" strokeWidth="3.8"
                  strokeDasharray={`${stockPct(stockData.low)} ${100-stockPct(stockData.low)}`}
                  strokeDashoffset={`${-stockPct(stockData.out)}`}/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.8"
                  strokeDasharray={`${stockPct(stockData.ok)} ${100-stockPct(stockData.ok)}`}
                  strokeDashoffset={`${-(stockPct(stockData.out)+stockPct(stockData.low))}`}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-ink">{stockData.total}</span>
                <span className="text-[9px] text-ink-3">total</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-ok"/><span className="text-ink-2">Disponibles</span></div>
                <span className="font-bold">{stockData.ok}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gold"/><span className="text-ink-2">Stock mínimo</span></div>
                <span className="font-bold">{stockData.low}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-danger"/><span className="text-ink-2">Agotados</span></div>
                <span className="font-bold">{stockData.out}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last sales */}
        <div className="card">
          <p className="font-bold text-sm text-ink mb-3">Últimas ventas</p>
          {ventas.length === 0 ? (
            <p className="text-center text-ink-3 text-sm py-4">Sin ventas en este período</p>
          ) : (
            <div className="space-y-2">
              {[...ventas].reverse().slice(0,20).map(v => (
                <div key={v.num} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-ink">Venta #{v.num}</p>
                    <p className="text-xs text-ink-3">{v.fecha} · {v.hora} · {v.items?.length} prod.</p>
                  </div>
                  <span className="font-bold text-ink">${v.tot.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, Icon, color='text-ink', bg='bg-white', colSpan=false }) {
  return (
    <div className={`${bg} rounded-xl2 shadow-card p-4 ${colSpan?'col-span-2':''}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
