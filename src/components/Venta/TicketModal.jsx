import { useEffect, useRef, useState } from 'react'
import { X, Share2, MapPin } from 'lucide-react'

const MAPS_URL = "https://maps.app.goo.gl/ZBwxJ18qeHzyDxBH7"

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
    setStatus('Cargando ticket...')
    try {
      // Load ticket.html in hidden iframe (same origin)
      const iframe = document.createElement('iframe')
      iframe.src = ticketURL + '&noauto=1'
      iframe.style.cssText = 'position:fixed;left:200vw;top:0;width:480px;height:900px;border:none'
      document.body.appendChild(iframe)

      // Wait for iframe to load + CDN scripts
      await new Promise((resolve, reject) => {
        iframe.onload = () => setTimeout(resolve, 1500)
        iframe.onerror = reject
        setTimeout(reject, 20000)
      })

      setStatus('Generando PDF...')

      // Call getTicketCanvas from ticket.html (uses ticket.html's own html2canvas)
      const getCanvas = iframe.contentWindow.getTicketCanvas
      if (!getCanvas) throw new Error('getTicketCanvas not available')

      const canvas = await getCanvas()
      document.body.removeChild(iframe)

      if (!canvas) throw new Error('canvas is null')

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
      setStatus('')
    } catch(e) {
      console.error('sharePDF error:', e)
      setStatus('Error: ' + e.message)
      setTimeout(() => setStatus(''), 3000)
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

        {/* Ticket preview */}
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

        {/* Buttons */}
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
