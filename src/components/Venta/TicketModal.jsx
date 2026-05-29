import { useEffect, useRef, useState } from 'react'
import { X, Share2, MapPin } from 'lucide-react'

const MAPS_URL = "https://maps.app.goo.gl/ZBwxJ18qeHzyDxBH7"
const LOGO_B64 = "data:image/png;base64,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"

function buildTicketPage(v) {
  const m = v.metodo==='efectivo'?'💵 Efectivo':v.metodo==='tarjeta'?'💳 Tarjeta':'🏦 Transferencia'
  const sub = (v.items||[]).reduce((s,i) => s + i.qty*i.precio, 0)
  const itemsHtml = (v.items||[]).map(it =>
    `<div class="item-row">
      <div><div class="item-nom">${it.nombre}</div>
      <div class="item-qty">${it.qty} unidad${it.qty>1?'es':''} \u00d7 $${it.precio.toFixed(2)}</div></div>
      <div class="item-pre">$${(it.qty*it.precio).toFixed(2)}</div>
    </div>`).join('')
  let totsHtml = ''
  if (v.desc > 0) {
    totsHtml += `<div class="totrow"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>`
    totsHtml += `<div class="totrow"><span>Descuento</span><span style="color:#6B9E78">-$${v.desc.toFixed(2)}</span></div>`
  }
  totsHtml += `<div class="totrow big"><span>Total</span><span>$${v.tot.toFixed(2)}</span></div>`
  let promoHtml = ''
  if (v.cupon)       promoHtml += `<div style="margin-top:10px;padding:8px 12px;background:#FDF6E3;border-radius:10px;font-size:12px;color:#B8952A;font-weight:700">\uD83C\uDFAB Cup\u00f3n: ${v.cupon}</div>`
  if (v.promoNombre) promoHtml += `<div style="margin-top:6px;padding:8px 12px;background:#FAF0F2;border-radius:10px;font-size:12px;color:#C4798A;font-weight:700">\uD83C\uDF89 Promo: ${v.promoNombre}</div>`
  const cambioHtml = v.cambio > 0 ? `<span style="font-size:12px;color:#6B6B7B;margin-left:8px">Cambio: $${v.cambio.toFixed(2)}</span>` : ''

  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></scr` + `ipt>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></scr` + `ipt>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:auto;overflow:visible}
body{font-family:Arial,sans-serif;background:#FAF0F2;padding:16px}
.card{background:#fff;border-radius:20px;padding:20px;margin-bottom:12px;box-shadow:0 2px 12px rgba(196,121,138,.10)}
.divider{border:none;border-top:1px dashed #EAEAF0;margin:12px 0}
.item-row{display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid #F5F5FA}
.item-row:last-child{border-bottom:none}
.item-nom{font-size:13px;font-weight:600;color:#1C1C2E;flex:1;margin-right:8px}
.item-qty{font-size:12px;color:#9B9BAB}
.item-pre{font-size:13px;font-weight:700;color:#1C1C2E;white-space:nowrap}
.totrow{display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;color:#6B6B7B}
.totrow.big{font-size:17px;font-weight:700;color:#1C1C2E;padding-top:8px;margin-top:4px;border-top:1.5px solid #EAEAF0}
.stitle{font-size:11px;font-weight:700;color:#9B9BAB;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.btn-wa{display:block;text-align:center;background:#25D366;color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:14px;text-decoration:none;margin-bottom:10px}
.btn-ig{display:block;text-align:center;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:14px;text-decoration:none;margin-bottom:10px}
.btn-cat{display:flex;align-items:center;justify-content:space-between;text-decoration:none;background:#FAF0F2;border-radius:14px;padding:14px 16px}
.btn-map{display:flex;align-items:center;gap:12px;background:#E8F0FE;padding:14px;border-radius:14px;margin-top:10px;text-decoration:none}
.info-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #F5F5FA;font-size:13px}
.info-row:last-child{border-bottom:none}
.info-icon{font-size:18px;min-width:24px;text-align:center;margin-top:1px}
.info-txt{color:#1C1C2E;line-height:1.5}
.info-sub{font-size:12px;color:#6B6B7B;margin-top:2px}
.policy-box{background:#F5F5FA;border-radius:14px;padding:14px;font-size:13px;color:#6B6B7B;line-height:1.7}
.policy-box ul{padding-left:16px;margin-top:6px}
.footer{text-align:center;font-size:11px;color:#9B9BAB;padding:8px 0 20px}
</style></head><body>
<div id="content" style="max-width:480px;margin:0 auto">
  <div class="card">
    <div style="text-align:center;margin-bottom:16px">
      <img src="${LOGO_B64}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;margin:0 auto 10px;display:block">
      <div style="font-size:22px;font-weight:700;color:#1C1C2E;font-family:serif">L-Ash Art</div>
      <div style="font-size:14px;color:#6B6B7B;margin-top:2px">\u00a1Gracias por tu compra! \uD83D\uDC95</div>
      <div style="font-size:12px;color:#9B9BAB;margin-top:4px">Venta #${v.num} \u00b7 ${v.fecha} ${v.hora}</div>
    </div>
    <hr class="divider">
    ${itemsHtml}
    <hr class="divider">
    ${totsHtml}
    <div style="margin-top:10px">
      <span style="background:#FAF0F2;color:#C4798A;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">${m}</span>
      ${cambioHtml}
    </div>
    ${promoHtml}
  </div>
  <div class="card">
    <div class="stitle">Cat\u00e1logo</div>
    <a class="btn-cat" href="https://lashart.kyte.site" target="_blank">
      <div><div style="font-size:15px;font-weight:700;color:#1C1C2E">Ver cat\u00e1logo completo</div>
      <div style="font-size:12px;color:#6B6B7B;margin-top:2px">lashart.kyte.site</div></div>
      <div style="font-size:24px">\uD83D\uDECD\uFE0F</div>
    </a>
  </div>
  <div class="card">
    <div class="stitle">Cont\u00e1ctanos</div>
    <a class="btn-wa" href="https://wa.me/525583810422" target="_blank">WhatsApp \u00b7 Lash Art</a>
    <a class="btn-ig" href="https://instagram.com/lash_art_store" target="_blank">@lash_art_store</a>
    <a class="btn-map" href="https://maps.app.goo.gl/ZBwxJ18qeHzyDxBH7" target="_blank">
      <span style="font-size:22px">\uD83D\uDCCD</span>
      <div><div style="font-size:14px;font-weight:700;color:#1A1A2E">Como llegar</div>
      <div style="font-size:11px;color:#4285F4">Ver en Google Maps</div></div>
    </a>
  </div>
  <div class="card">
    <div class="stitle">Informaci\u00f3n</div>
    <div class="info-row"><div class="info-icon">\uD83D\ude97</div><div class="info-txt"><strong>Env\u00edos</strong><div class="info-sub">Locales por Uber o Didi \u00b7 Nacionales por paqueter\u00eda a todo M\u00e9xico</div></div></div>
    <div class="info-row"><div class="info-icon">\uD83D\uDCB3</div><div class="info-txt"><strong>M\u00e9todos de pago</strong><div class="info-sub">Transferencia bancaria \u00b7 Tarjeta de cr\u00e9dito o d\u00e9bito</div></div></div>
  </div>
  <div class="card">
    <div class="stitle">Pol\u00edtica de cambios</div>
    <div class="policy-box">
      Cambios dentro de los <strong>7 d\u00edas naturales</strong> con producto sin abrir y n\u00famero de venta.
      <ul><li>Sin cambios en productos abiertos o usados</li><li>Dudas por WhatsApp</li></ul>
    </div>
  </div>
  <div class="footer">L-Ash Art \u00a9 2025 \u00b7 Hecho con \uD83D\uDC95</div>
</div>
<script>
async function getTicketPDFBlob(forcedH){
  var waited=0;
  while((typeof html2canvas==="undefined"||typeof window.jspdf==="undefined")&&waited<12000){
    await new Promise(function(r){setTimeout(r,200);}); waited+=200;
  }
  if(typeof html2canvas==="undefined"||typeof window.jspdf==="undefined")return null;
  await new Promise(function(r){setTimeout(r,300);});
  var el=document.body;
  // Altura: preferir el valor pasado desde el padre; fallback a scrollHeight
  var h=forcedH||Math.max(
    document.body.scrollHeight,document.body.offsetHeight,
    document.documentElement.scrollHeight,3000
  );
  try{
    var canvas=await html2canvas(el,{
      scale:2,useCORS:true,allowTaint:true,
      backgroundColor:"#FAF0F2",logging:false,
      width:480,windowWidth:480,
      height:h,windowHeight:h,
      scrollX:0,scrollY:0
    });
    if(!canvas)return null;
    var J=window.jspdf.jsPDF;
    var doc=new J({unit:"mm",format:"a4",orientation:"portrait"});
    var pw=210,totalH=canvas.height*pw/canvas.width;
    doc.addImage(canvas.toDataURL("image/jpeg",0.92),"JPEG",0,0,pw,totalH);
    return doc.output("blob");
  }catch(e){console.error("getTicketPDFBlob:",e);return null;}
}
window.getTicketPDFBlob=getTicketPDFBlob;
</scr` + `ipt>
</body></html>`
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
      const iframe = document.createElement('iframe')
      iframe.style.cssText = [
        'position:fixed','left:0','top:0',
        'width:480px','height:2400px',
        'border:none','z-index:1','pointer-events:none'
      ].join(';')
      iframe.srcdoc = buildTicketPage(venta)
      document.body.appendChild(iframe)

      // Esperar carga + CDN scripts (jspdf + html2canvas)
      await new Promise((resolve, reject) => {
        iframe.onload = () => setTimeout(resolve, 3000)
        iframe.onerror = reject
        setTimeout(reject, 35000)
      })

      // Leer altura desde el padre (más confiable que desde dentro del iframe)
      const iDoc = iframe.contentDocument
      const contentH = iDoc
        ? Math.max(
            iDoc.body?.scrollHeight || 0,
            iDoc.body?.offsetHeight || 0,
            iDoc.documentElement?.scrollHeight || 0,
            3000
          )
        : 3000

      setStatus('Generando PDF...')

      const getPDF = iframe.contentWindow?.getTicketPDFBlob
      if (!getPDF) throw new Error('getTicketPDFBlob no disponible')

      const blob = await getPDF(contentH)
      document.body.removeChild(iframe)

      if (!blob) throw new Error('PDF vacío')

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

        <div style={{background:'#FAF0F2', padding:'12px', fontFamily:'Arial,sans-serif'}}>
          <div style={{background:'#fff', borderRadius:'16px', padding:'16px', marginBottom:'10px'}}>
            <div style={{textAlign:'center'}}>
              <img src={LOGO_B64} style={{width:'64px',height:'64px',borderRadius:'50%',objectFit:'cover',margin:'0 auto 8px',display:'block'}}/>
              <div style={{fontSize:'20px',fontWeight:'700',color:'#1C1C2E'}}>L-Ash Art</div>
              <div style={{fontSize:'11px',color:'#6B6B7B',marginTop:'2px'}}>¡Gracias por tu compra! 💕</div>
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

        <div className="px-5 py-3 flex flex-col items-center gap-2 border-t border-gray-100">
          <p className="section-title">Codigo QR del ticket</p>
          <div ref={qrRef} className="rounded-xl overflow-hidden"/>
          <p className="text-xs text-ink-3 text-center">El cliente lo escanea para ver su ticket</p>
        </div>

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
