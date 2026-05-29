import { useEffect, useRef, useState } from 'react'
import { X, Share2, MapPin } from 'lucide-react'

const MAPS_URL = "https://maps.app.goo.gl/ZBwxJ18qeHzyDxBH7"
const LOGO_URL = "/Controlashart/icon-180.png"

function buildTicketPage(v) {
  const m = v.metodo==='efectivo'?'Efectivo':v.metodo==='tarjeta'?'Tarjeta':'Transferencia'
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
  if (v.cupon)       promoHtml += `<div style="margin-top:10px;padding:8px 12px;background:#FDF6E3;border-radius:10px;font-size:12px;color:#B8952A;font-weight:700">Cup\u00f3n: ${v.cupon}</div>`
  if (v.promoNombre) promoHtml += `<div style="margin-top:6px;padding:8px 12px;background:#FAF0F2;border-radius:10px;font-size:12px;color:#C4798A;font-weight:700">Promo: ${v.promoNombre}</div>`
  const cambioHtml = v.cambio > 0 ? `<span style="font-size:12px;color:#6B6B7B;margin-left:8px">Cambio: $${v.cambio.toFixed(2)}</span>` : ''

  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
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
.info-icon{font-size:18px;min-width:24px;text-align:center}
.info-txt{color:#1C1C2E;line-height:1.5}
.info-sub{font-size:12px;color:#6B6B7B;margin-top:2px}
.policy-box{background:#F5F5FA;border-radius:14px;padding:14px;font-size:13px;color:#6B6B7B;line-height:1.7}
.policy-box ul{padding-left:16px;margin-top:6px}
.footer{text-align:center;font-size:11px;color:#9B9BAB;padding:8px 0 20px}
</style></head><body>
<div id="content" style="max-width:480px;margin:0 auto">
  <div class="card">
    <div style="text-align:center;margin-bottom:16px">
      <img src="/Controlashart/icon-180.png" style="width:70px;height:70px;border-radius:50%;object-fit:cover;margin:0 auto 10px;display:block" crossorigin="anonymous">
      <div style="font-size:22px;font-weight:700;color:#1C1C2E;font-family:serif">L-Ash Art</div>
      <div style="font-size:14px;color:#6B6B7B;margin-top:2px">Gracias por tu compra!</div>
      <div style="font-size:12px;color:#9B9BAB;margin-top:4px">Venta #${v.num} - ${v.fecha} ${v.hora}</div>
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
    <div class="stitle">Catalogo</div>
    <a class="btn-cat" href="https://lashart.kyte.site">
      <div><div style="font-size:15px;font-weight:700;color:#1C1C2E">Ver catalogo completo</div>
      <div style="font-size:12px;color:#6B6B7B;margin-top:2px">lashart.kyte.site</div></div>
      <div style="font-size:24px">&#128717;</div>
    </a>
  </div>
  <div class="card">
    <div class="stitle">Contactanos</div>
    <a class="btn-wa" href="https://wa.me/525583810422">WhatsApp - Lash Art</a>
    <a class="btn-ig" href="https://instagram.com/lash_art_store">@lash_art_store</a>
    <a class="btn-map" href="https://maps.app.goo.gl/ZBwxJ18qeHzyDxBH7">
      <span style="font-size:22px">&#128205;</span>
      <div><div style="font-size:14px;font-weight:700;color:#1A1A2E">Como llegar</div>
      <div style="font-size:11px;color:#4285F4">Ver en Google Maps</div></div>
    </a>
  </div>
  <div class="card">
    <div class="stitle">Informacion</div>
    <div class="info-row"><div class="info-icon">&#128663;</div><div class="info-txt"><strong>Envios</strong><div class="info-sub">Locales por Uber o Didi - Nacionales por paqueteria a todo Mexico</div></div></div>
    <div class="info-row"><div class="info-icon">&#128179;</div><div class="info-txt"><strong>Metodos de pago</strong><div class="info-sub">Transferencia bancaria - Tarjeta de credito o debito</div></div></div>
  </div>
  <div class="card">
    <div class="stitle">Politica de cambios</div>
    <div class="policy-box">
      Cambios dentro de los <strong>7 dias naturales</strong> con producto sin abrir y numero de venta.
      <ul><li>Sin cambios en productos abiertos o usados</li><li>Dudas por WhatsApp</li></ul>
    </div>
  </div>
  <div class="footer">L-Ash Art 2025 - Hecho con amor</div>
</div>
<script>
async function getTicketPDFBlob(forcedH){
  var waited=0;
  while((typeof html2canvas==="undefined"||typeof window.jspdf==="undefined")&&waited<12000){
    await new Promise(function(r){setTimeout(r,200);}); waited+=200;
  }
  if(typeof html2canvas==="undefined"||typeof window.jspdf==="undefined")return null;
  await new Promise(function(r){setTimeout(r,400);});
  var el=document.body;
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
  }catch(e){console.error("PDF:",e);return null;}
}
window.getTicketPDFBlob=getTicketPDFBlob;
<\/script>
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
      iframe.style.cssText = 'position:fixed;left:0;top:0;width:480px;height:2400px;border:none;z-index:1;pointer-events:none'
      iframe.srcdoc = buildTicketPage(venta)
      document.body.appendChild(iframe)

      await new Promise((resolve, reject) => {
        iframe.onload = () => setTimeout(resolve, 3000)
        iframe.onerror = reject
        setTimeout(reject, 35000)
      })

      const iDoc = iframe.contentDocument
      const contentH = iDoc ? Math.max(
        iDoc.body?.scrollHeight || 0,
        iDoc.body?.offsetHeight || 0,
        iDoc.documentElement?.scrollHeight || 0,
        3000
      ) : 3000

      setStatus('Generando PDF...')
      const getPDF = iframe.contentWindow?.getTicketPDFBlob
      if (!getPDF) throw new Error('getTicketPDFBlob no disponible')

      const blob = await getPDF(contentH)
      document.body.removeChild(iframe)
      if (!blob) throw new Error('PDF vacio')

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
              <img src={LOGO_URL} style={{width:'64px',height:'64px',borderRadius:'50%',objectFit:'cover',margin:'0 auto 8px',display:'block'}}
                onError={e => { e.target.style.display='none' }}/>
              <div style={{fontSize:'20px',fontWeight:'700',color:'#1C1C2E'}}>L-Ash Art</div>
              <div style={{fontSize:'11px',color:'#6B6B7B',marginTop:'2px'}}>Gracias por tu compra! 💕</div>
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
