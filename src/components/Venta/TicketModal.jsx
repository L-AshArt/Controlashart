import { useEffect, useRef, useState } from 'react'
import { X, Share2 } from 'lucide-react'
import { pNom } from '../../utils/products'

export default function TicketModal({ venta, onClose }) {
  const qrRef = useRef(null)
  const [sharing, setSharing] = useState(false)

  // Short URL - just the sale number, ticket.html fetches from Firebase
  const base = window.location.href.split('?')[0].replace('index.html','')
  const url = base + 'ticket.html?v=' + venta.num

  useEffect(() => {
    if (!qrRef.current) return
    qrRef.current.innerHTML = ''
    const tryQR = () => {
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrRef.current, {
          text: url, width: 200, height: 200,
          colorDark: '#1A1A2E', colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M,
        })
      } else {
        setTimeout(tryQR, 500)
      }
    }
    tryQR()
  }, [url])

  async function sharePDF() {
    setSharing(true)
    const html = buildHTML(venta)
    const wrap = document.createElement('div')
    wrap.style.cssText = 'position:fixed;left:100vw;top:0;width:560px;z-index:9999'
    wrap.innerHTML = html
    document.body.appendChild(wrap)
    await new Promise(r => setTimeout(r, 400))
    try {
      const canvas = await html2canvas(wrap, {
        scale: 2, useCORS: false, allowTaint: true,
        backgroundColor: '#FAF0F2', logging: false, width: 560
      })
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
    }
    setSharing(false)
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-ink">Venta #{venta.num} completada</h3>
          <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
        </div>

        {/* Summary */}
        <div className="card space-y-1.5">
          {venta.items?.map((it,i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-ink-2 flex-1 truncate">{it.qty}x {it.nombre}</span>
              <span className="font-semibold text-ink ml-2">${(it.precio*it.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
            <span>Total</span><span>${venta.tot.toFixed(2)}</span>
          </div>
          <div className="text-xs text-ink-3">{venta.fecha} · {venta.hora} · {venta.metodo}</div>
        </div>

        {/* QR */}
        <div className="card flex flex-col items-center gap-3">
          <p className="section-title">Codigo QR del ticket</p>
          <div ref={qrRef} className="rounded-xl overflow-hidden"/>
          <p className="text-xs text-ink-3 text-center">El cliente lo escanea para ver su ticket</p>
        </div>

        <button onClick={sharePDF} disabled={sharing}
          className="btn-primary w-full flex items-center justify-center gap-2">
          <Share2 size={18}/> {sharing ? 'Generando...' : 'Compartir PDF'}
        </button>
        <button onClick={onClose} className="btn-secondary w-full">Cerrar</button>
      </div>
    </div>
  )
}

function buildHTML(v) {
  const m = v.metodo==='efectivo'?'Efectivo':v.metodo==='tarjeta'?'Tarjeta':'Transferencia'
  const items = (v.items||[]).map(it=>
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F5F5FA">'
    +'<div style="flex:1;margin-right:8px"><div style="font-size:12px;font-weight:600;color:#1C1C2E">'+it.nombre+'</div>'
    +'<div style="font-size:11px;color:#9B9BAB">'+it.qty+' ud. x $'+it.precio.toFixed(2)+'</div></div>'
    +'<div style="font-size:12px;font-weight:700;color:#1C1C2E;white-space:nowrap">$'+(it.qty*it.precio).toFixed(2)+'</div></div>'
  ).join('')
  return '<div style="background:#FAF0F2;padding:14px;font-family:Arial,sans-serif;width:560px">'
    +'<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:10px;text-align:center">'
    +'<div style="width:60px;height:60px;border-radius:50%;background:#C4798A;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;margin:0 auto 10px">LA</div>'
    +'<div style="font-size:20px;font-weight:700;color:#1C1C2E">L-Ash Art</div>'
    +'<div style="font-size:12px;color:#6B6B7B;margin-top:3px">Gracias por tu compra!</div>'
    +'<div style="font-size:10px;color:#9B9BAB;margin-top:2px">Venta #'+v.num+' - '+v.fecha+' '+v.hora+'</div>'
    +'<div style="border-top:1px dashed #EAEAF0;margin:12px 0"></div>'
    +items
    +'<div style="border-top:1px dashed #EAEAF0;margin:10px 0"></div>'
    +'<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:17px;font-weight:700;color:#1C1C2E"><span>Total</span><span>$'+v.tot.toFixed(2)+'</span></div>'
    +'<div style="margin-top:8px;text-align:left"><span style="background:#FAF0F2;color:#C4798A;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px">'+m+'</span></div>'
    +'</div>'
    +'<div style="background:#fff;border-radius:16px;padding:14px;margin-bottom:10px">'
    +'<div style="display:flex;gap:8px">'
    +'<a href="https://wa.me/525583810422" data-pdf-link="https://wa.me/525583810422" style="flex:1;display:flex;align-items:center;justify-content:center;background:#25D366;color:#fff;font-weight:700;font-size:13px;padding:12px;border-radius:12px;text-decoration:none">WhatsApp</a>'
    +'<a href="https://instagram.com/lash_art_store" data-pdf-link="https://instagram.com/lash_art_store" style="flex:1;display:flex;align-items:center;justify-content:center;background:#C4798A;color:#fff;font-weight:700;font-size:13px;padding:12px;border-radius:12px;text-decoration:none">@lash_art_store</a>'
    +'</div></div>'
    +'<div style="background:#fff;border-radius:16px;padding:14px">'
    +'<a href="https://lashart.kyte.site" data-pdf-link="https://lashart.kyte.site" style="display:flex;align-items:center;justify-content:space-between;background:#FAF0F2;border-radius:10px;padding:10px 12px;text-decoration:none">'
    +'<div><div style="font-size:13px;font-weight:700;color:#1C1C2E">Ver catalogo</div><div style="font-size:10px;color:#6B6B7B">lashart.kyte.site</div></div>'
    +'<div style="font-size:20px">&#128722;</div></a></div>'
    +'</div>'
}
