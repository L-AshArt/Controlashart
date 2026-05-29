import { useEffect, useRef, useState } from 'react'
import { X, Share2, MapPin } from 'lucide-react'

const MAPS_URL = "https://maps.app.goo.gl/ZBwxJ18qeHzyDxBH7"

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) { setTimeout(resolve, 100); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => setTimeout(resolve, 100)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function ticketHTML(v) {
  const m = v.metodo==='efectivo'?'💵 Efectivo':v.metodo==='tarjeta'?'💳 Tarjeta':'🏦 Transferencia'
  const sub = (v.items||[]).reduce((s,i) => s + i.qty*i.precio, 0)
  const items = (v.items||[]).map(it => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid #F5F5FA">
      <div style="flex:1;margin-right:8px">
        <div style="font-size:13px;font-weight:600;color:#1C1C2E">${it.nombre}</div>
        <div style="font-size:12px;color:#9B9BAB">${it.qty} unidad${it.qty>1?'es':''} × $${it.precio.toFixed(2)}</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:#1C1C2E;white-space:nowrap">$${(it.qty*it.precio).toFixed(2)}</div>
    </div>`).join('')
  let tots = ''
  if (v.desc > 0) {
    tots += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#6B6B7B"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>`
    tots += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#6B6B7B"><span>Descuento</span><span style="color:#6B9E78">-$${v.desc.toFixed(2)}</span></div>`
  }
  tots += `<div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;color:#1C1C2E;padding-top:8px;margin-top:4px;border-top:1.5px solid #EAEAF0"><span>Total</span><span>$${v.tot.toFixed(2)}</span></div>`
  let promo = ''
  if (v.cupon)      promo += `<div style="margin-top:10px;padding:8px 12px;background:#FDF6E3;border-radius:10px;font-size:12px;color:#B8952A;font-weight:700">🎫 Cupón: ${v.cupon}</div>`
  if (v.promoNombre) promo += `<div style="margin-top:6px;padding:8px 12px;background:#FAF0F2;border-radius:10px;font-size:12px;color:#C4798A;font-weight:700">🎉 Promo: ${v.promoNombre}</div>`
  const sec = (t,c) => `<div style="font-size:11px;font-weight:700;color:#9B9BAB;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">${t}</div>${c}`
  const card = (inner) => `<div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:12px;box-shadow:0 2px 12px rgba(196,121,138,.10)">${inner}</div>`
  return `<div style="background:#FAF0F2;padding:16px;font-family:Arial,sans-serif;width:480px">
    ${card(`
      <div style="text-align:center;margin-bottom:16px">
        <div style="width:64px;height:64px;border-radius:50%;background:#C4798A;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;margin:0 auto 8px;font-family:serif">LA</div>
        <div style="font-size:22px;font-weight:700;color:#1C1C2E;font-family:serif">L-Ash Art</div>
        <div style="font-size:14px;color:#6B6B7B;margin-top:2px">¡Gracias por tu compra! 💕</div>
        <div style="font-size:12px;color:#9B9BAB;margin-top:4px">Venta #${v.num} · ${v.fecha} ${v.hora}</div>
      </div>
      <div style="border-top:1px dashed #EAEAF0;margin:12px 0"></div>
      ${items}
      <div style="border-top:1px dashed #EAEAF0;margin:12px 0"></div>
      ${tots}
      <div style="margin-top:10px">
        <span style="background:#FAF0F2;color:#C4798A;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">${m}</span>
        ${v.cambio > 0 ? `<span style="font-size:12px;color:#6B6B7B;margin-left:8px">Cambio: $${v.cambio.toFixed(2)}</span>` : ''}
      </div>
      ${promo}
    `)}
    ${card(sec('Catálogo', `
      <div style="display:flex;align-items:center;justify-content:space-between;background:#FAF0F2;border-radius:14px;padding:14px 16px">
        <div><div style="font-size:15px;font-weight:700;color:#1C1C2E">Ver catálogo completo</div><div style="font-size:12px;color:#6B6B7B;margin-top:2px">lashart.kyte.site</div></div>
        <div style="font-size:24px">🛍️</div>
      </div>`))}
    ${card(sec('Contáctanos', `
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:14px;margin-bottom:10px">
        WhatsApp · Lash Art
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:14px;margin-bottom:10px">
        @lash_art_store
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:#E8F0FE;padding:14px;border-radius:14px">
        <span style="font-size:22px">📍</span>
        <div><div style="font-size:14px;font-weight:700;color:#1A1A2E">Como llegar</div><div style="font-size:11px;color:#4285F4">Ver en Google Maps</div></div>
      </div>`))}
    ${card(sec('Información', `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #F5F5FA;font-size:13px">
        <div style="font-size:18px;min-width:24px;text-align:center">🚗</div>
        <div style="color:#1C1C2E;line-height:1.5"><strong>Envíos</strong><div style="font-size:12px;color:#6B6B7B;margin-top:2px">Locales por Uber o Didi · Nacionales por paquetería a todo México</div></div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;font-size:13px">
        <div style="font-size:18px;min-width:24px;text-align:center">💳</div>
        <div style="color:#1C1C2E;line-height:1.5"><strong>Métodos de pago</strong><div style="font-size:12px;color:#6B6B7B;margin-top:2px">Transferencia bancaria · Tarjeta de crédito o débito</div></div>
      </div>`))}
    ${card(sec('Política de cambios', `
      <div style="background:#F5F5FA;border-radius:14px;padding:14px;font-size:13px;color:#6B6B7B;line-height:1.7">
        Cambios dentro de los <strong>7 días naturales</strong> con producto sin abrir y número de venta.
        <ul style="padding-left:16px;margin-top:6px"><li>Sin cambios en productos abiertos o usados</li><li>Dudas por WhatsApp</li></ul>
      </div>`))}
    <div style="text-align:center;font-size:11px;color:#9B9BAB;padding:8px 0 20px">L-Ash Art © 2025 · Hecho con 💕</div>
  </div>`
}

export default function TicketModal({ venta, onClose }) {
  const qrRef = useRef(null)
  const [sharing, setSharing] = useState(false)
  const [status, setStatus] = useState('')

  const ticketURL = window.location.origin + '/Controlashart/ticket.html?v=' + venta.num
  const m = venta.metodo==='efectivo'?'Efectivo':venta.metodo==='tarjeta'?'Tarjeta':'Transferencia'

  useEffect(() => {
    if (!qrRef.current) return
    qrRef.current.innerHTML = ''
    const tryQR = () => {
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrRef.current, { text: ticketURL, width: 180, height: 180,
          colorDark: '#1A1A2E', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M })
      } else { setTimeout(tryQR, 500) }
    }
    tryQR()
  }, [ticketURL])

  async function sharePDF() {
    setSharing(true)
    setStatus('Cargando...')
    try {
      // Cargar librerías si no están disponibles
      if (typeof window.html2canvas === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      }
      if (typeof window.jspdf === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      }

      setStatus('Generando PDF...')

      // Div temporal con el diseño completo del ticket
      // z-index:1 → queda detrás del modal (z-40) pero el browser lo renderiza
      const container = document.createElement('div')
      container.style.cssText = 'position:absolute;left:0;top:0;z-index:1;pointer-events:none;overflow:visible'
      container.innerHTML = ticketHTML(venta)
      document.body.appendChild(container)

      // Esperar a que el browser pinte el div
      await new Promise(r => setTimeout(r, 400))

      const canvas = await window.html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF0F2',
        logging: false,
        width: 480,
        windowWidth: 480,
      })

      document.body.removeChild(container)

      const J = window.jspdf.jsPDF
      const doc = new J({ unit: 'mm', format: 'a4' })
      const pw = 210
      const totalH = canvas.height * pw / canvas.width
      doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, totalH)

      const blob = doc.output('blob')
      const file = new File([blob], 'ticket-' + venta.num + '.pdf', { type: 'application/pdf' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Ticket L-Ash Art #' + venta.num })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'ticket-' + venta.num + '.pdf'
        a.click()
      }
      setStatus('')
    } catch(e) {
      console.error('sharePDF error:', e)
      setStatus('Error: ' + e.message)
      setTimeout(() => setStatus(''), 4000)
    }
    setSharing(false)
  }

  const row = { display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F5F5FA' }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl" style={{maxHeight:'92vh', overflowY:'auto'}}>

        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-base font-bold text-ink">Venta #{venta.num} completada</h3>
          <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
        </div>

        {/* Preview del ticket */}
        <div style={{background:'#FAF0F2', padding:'12px', fontFamily:'Arial,sans-serif'}}>
          <div style={{background:'#fff', borderRadius:'16px', padding:'16px', marginBottom:'10px'}}>
            <div style={{textAlign:'center'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'#C4798A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0 auto 8px',fontFamily:'serif'}}>LA</div>
              <div style={{fontSize:'20px',fontWeight:'700',color:'#1C1C2E'}}>L-Ash Art</div>
              <div style={{fontSize:'11px',color:'#6B6B7B',marginTop:'2px'}}>Gracias por tu compra!</div>
              <div style={{fontSize:'10px',color:'#9B9BAB',marginTop:'2px'}}>Venta #{venta.num} · {venta.fecha} {venta.hora}</div>
            </div>
            <div style={{borderTop:'1px dashed #EAEAF0',margin:'10px 0'}}/>
            {venta.items?.map((it,i) => (
              <div key={i} style={row}>
                <div style={{flex:1,marginRight:'8px'}}>
                  <div style={{fontSize:'11px',fontWeight:'600',color:'#1C1C2E'}}>{it.nombre}</div>
                  <div style={{fontSize:'10px',color:'#9B9BAB'}}>{it.qty} ud. x ${it.precio?.toFixed(2)}</div>
                </div>
                <div style={{fontSize:'11px',fontWeight:'700',color:'#1C1C2E'}}>${(it.qty*it.precio).toFixed(2)}</div>
              </div>
            ))}
            <div style={{borderTop:'1px dashed #EAEAF0',margin:'8px 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'15px',fontWeight:'700',color:'#1C1C2E',padding:'4px 0'}}>
              <span>Total</span><span>${venta.tot?.toFixed(2)}</span>
            </div>
            <span style={{background:'#FAF0F2',color:'#C4798A',fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'20px',display:'inline-block',marginTop:'6px'}}>{m}</span>
          </div>
        </div>

        {/* QR */}
        <div className="px-5 py-3 flex flex-col items-center gap-2 border-t border-gray-100">
          <p className="section-title">Codigo QR del ticket</p>
          <div ref={qrRef} className="rounded-xl overflow-hidden"/>
          <p className="text-xs text-ink-3 text-center">El cliente lo escanea para ver su ticket</p>
        </div>

        {/* Botones */}
        <div className="px-5 pb-6 pt-2 space-y-2">
          <a href={MAPS_URL} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 no-underline">
            <MapPin size={18} className="text-blue-500 flex-shrink-0"/>
            <div>
              <p className="text-sm font-bold text-ink">Como llegar</p>
              <p className="text-xs text-blue-500">Ver en Google Maps</p>
            </div>
          </a>
          {status && <p className="text-xs text-ink-3 text-center">{status}</p>}
          <button onClick={sharePDF} disabled={sharing}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Share2 size={18}/> {sharing ? status || 'Generando...' : 'Compartir PDF'}
          </button>
          <button onClick={onClose} className="btn-secondary w-full">Cerrar</button>
        </div>

      </div>
    </div>
  )
        }
