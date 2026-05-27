import { X, Share2, Trash2 } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useToast } from '../Layout/Toast'

export default function VentaDetailModal({ venta, onClose }) {
  const { update } = useDB()
  const toast = useToast()

  async function sharePDF() {
    toast('Generando PDF...', 'in')
    const html = buildHTML(venta)
    const wrap = document.createElement('div')
    wrap.style.cssText = 'position:fixed;left:100vw;top:0;width:560px;z-index:9999'
    wrap.innerHTML = html
    document.body.appendChild(wrap)
    await new Promise(r => setTimeout(r, 400))
    try {
      const canvas = await html2canvas(wrap, { scale: 2, useCORS: false, allowTaint: true, backgroundColor: '#FAF0F2', logging: false })
      document.body.removeChild(wrap)
      const J = window.jspdf.jsPDF
      const doc = new J({ unit: 'mm', format: 'a4' })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const pw = 210, totalH = canvas.height * pw / canvas.width
      doc.addImage(imgData, 'JPEG', 0, 0, pw, totalH)
      const blob = doc.output('blob')
      const file = new File([blob], 'ticket-' + venta.num + '.pdf', { type: 'application/pdf' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Ticket #' + venta.num })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'ticket-' + venta.num + '.pdf'
        a.click()
      }
    } catch(e) {
      if (document.body.contains(wrap)) document.body.removeChild(wrap)
      toast('Error al generar PDF', 'er')
    }
  }

  function cancelarVenta() {
    if (!confirm('Cancelar venta #' + venta.num + '?')) return
    // Restore stock
    update('prods', ps => ps.map(p => {
      const it = venta.items?.find(i => i.prodId === p.id)
      return it ? { ...p, stock: (p.stock || 0) + it.qty } : p
    }))
    // Remove venta
    update('ventas', vs => vs.filter(v => v.num !== venta.num))
    toast('Venta #' + venta.num + ' cancelada', 'ok')
    onClose()
  }

  const metLabel = venta.metodo === 'efectivo' ? 'Efectivo' :
    venta.metodo === 'tarjeta' ? 'Tarjeta' : 'Transferencia'

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-ink">Venta #{venta.num}</h3>
            <p className="text-xs text-ink-3">{venta.fecha} · {venta.hora}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Items */}
          <div className="card space-y-2">
            {venta.items?.map((it, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="font-medium text-ink truncate">{it.nombre}</p>
                  <p className="text-xs text-ink-3">{it.qty} ud. x ${it.precio?.toFixed(2)}</p>
                </div>
                <span className="font-bold text-ink">${(it.precio * it.qty).toFixed(2)}</span>
              </div>
            ))}
            {venta.desc > 0 && (
              <div className="flex justify-between text-sm text-ok">
                <span>Descuento</span>
                <span>-${venta.desc.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>${venta.tot.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-rosa">{metLabel}</span>
              {venta.cambio > 0 && <span className="text-xs text-ink-3">Cambio: ${venta.cambio.toFixed(2)}</span>}
            </div>
            {venta.cliente && <p className="text-xs text-ink-3">Cliente: {venta.cliente}</p>}
            {venta.nota && <p className="text-xs text-ink-3">Nota: {venta.nota}</p>}
          </div>

          {/* Actions */}
          <button onClick={sharePDF} className="btn-primary w-full flex items-center justify-center gap-2">
            <Share2 size={18}/> Compartir PDF
          </button>
          <button onClick={cancelarVenta} className="btn-danger w-full flex items-center justify-center gap-2">
            <Trash2 size={18}/> Cancelar venta
          </button>
        </div>
      </div>
    </div>
  )
}

function buildHTML(v) {
  const metLabel = v.metodo === 'efectivo' ? 'Efectivo' : v.metodo === 'tarjeta' ? 'Tarjeta' : 'Transferencia'
  const itemsHTML = (v.items || []).map(it =>
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F5F5FA">'
    + '<div style="flex:1;margin-right:8px"><div style="font-size:12px;font-weight:600;color:#1C1C2E">' + it.nombre + '</div>'
    + '<div style="font-size:11px;color:#9B9BAB">' + it.qty + ' ud. x $' + it.precio.toFixed(2) + '</div></div>'
    + '<div style="font-size:12px;font-weight:700;color:#1C1C2E">$' + (it.qty * it.precio).toFixed(2) + '</div></div>'
  ).join('')
  return '<div style="background:#FAF0F2;padding:14px;font-family:Arial,sans-serif;width:560px">'
    + '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:10px;text-align:center">'
    + '<img src="https://l-ashart.github.io/Controlashart/icon-180.png" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin:0 auto 10px;display:block" onerror="this.style.display=\'none\'">'
    + '<div style="font-size:20px;font-weight:700;color:#1C1C2E">L-Ash Art</div>'
    + '<div style="font-size:12px;color:#6B6B7B;margin-top:3px">Gracias por tu compra!</div>'
    + '<div style="font-size:10px;color:#9B9BAB;margin-top:2px">Venta #' + v.num + ' - ' + v.fecha + ' ' + v.hora + '</div>'
    + '<div style="border-top:1px dashed #EAEAF0;margin:12px 0"></div>'
    + itemsHTML
    + '<div style="border-top:1px dashed #EAEAF0;margin:10px 0"></div>'
    + '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:17px;font-weight:700;color:#1C1C2E"><span>Total</span><span>$' + v.tot.toFixed(2) + '</span></div>'
    + '<div style="margin-top:8px;text-align:left"><span style="background:#FAF0F2;color:#C4798A;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px">' + metLabel + '</span></div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:16px;padding:14px;margin-bottom:10px">'
    + '<div style="display:flex;gap:8px">'
    + '<a href="https://wa.me/525583810422" style="flex:1;display:flex;align-items:center;justify-content:center;background:#25D366;color:#fff;font-weight:700;font-size:13px;padding:12px;border-radius:12px;text-decoration:none">WhatsApp</a>'
    + '<a href="https://instagram.com/lash_art_store" style="flex:1;display:flex;align-items:center;justify-content:center;background:#C4798A;color:#fff;font-weight:700;font-size:13px;padding:12px;border-radius:12px;text-decoration:none">@lash_art_store</a>'
    + '</div></div>'
    + '<div style="background:#fff;border-radius:16px;padding:14px">'
    + '<div style="font-size:9px;font-weight:700;color:#9B9BAB;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">CATALOGO</div>'
    + '<a href="https://lashart.kyte.site" style="display:flex;align-items:center;justify-content:space-between;background:#FAF0F2;border-radius:10px;padding:10px 12px;text-decoration:none">'
    + '<div><div style="font-size:13px;font-weight:700;color:#1C1C2E">Ver catalogo</div><div style="font-size:10px;color:#6B6B7B">lashart.kyte.site</div></div>'
    + '<div style="font-size:20px">&#128722;</div></a></div>'
    + '</div>'
                                        }
