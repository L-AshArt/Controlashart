import { X, Share2, Trash2 } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useToast } from '../Layout/Toast'

export default function VentaDetailModal({ venta, onClose }) {
  const { update } = useDB()
  const toast = useToast()

  async function getLogoB64() {
    try {
      const r = await fetch('https://l-ashart.github.io/Controlashart/icon-180.png')
      const blob = await r.blob()
      return await new Promise(res => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(blob) })
    } catch { return null }
  }

  async function sharePDF() {
    toast('Generando PDF...', 'in')
    const logo = await getLogoB64()
    const html = buildHTML(venta, logo)
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

const LOGO_B64 = "data:image/png;base64,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"

function buildHTML(v, logo) {
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
