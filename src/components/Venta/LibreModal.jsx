import { useState } from 'react'
import { X } from 'lucide-react'
import { useToast } from '../Layout/Toast'
import ProductForm from '../Catalogo/ProductForm'

export default function LibreModal({ onClose, onAdd, isAdmin }) {
  const toast = useToast()
  const [nombre,     setNombre]     = useState('')
  const [precio,     setPrecio]     = useState('')
  const [costo,      setCosto]      = useState('')
  const [showCatalog, setShowCatalog] = useState(false)
  const [prefill,    setPrefill]    = useState(null)

  function add() {
    if (!nombre.trim() || !parseFloat(precio)) {
      toast('Completa nombre y precio', 'er'); return
    }

    onAdd({
      id:            `libre_${Date.now()}`,
      nombre:        nombre.trim(),
      libre:         true,
      precioMenudeo: parseFloat(precio),
      costo:         parseFloat(costo) || 0,
      stock:         99,
      tipo:          'otro',
    })

    if (isAdmin) {
      const save = confirm(`Â¿Agregar "${nombre.trim()}" al catÃ¡logo?`)
      if (save) {
        setPrefill({ nombre: nombre.trim(), precio: parseFloat(precio), costo: parseFloat(costo)||0 })
        setShowCatalog(true)
        return
      }
    }

    onClose()
  }

  if (showCatalog) {
    return <ProductForm prefill={prefill} onClose={onClose}/>
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-ink">Producto libre</h3>
          <button onClick={onClose}><X size={20} className="text-ink-2"/></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="section-title">DescripciÃ³n</label>
            <input className="input" placeholder="ej. EnvÃ­o, descuento especial..."
              value={nombre} onChange={e=>setNombre(e.target.value)}/>
          </div>
          <div>
            <label className="section-title">Precio de venta</label>
            <input className="input text-xl font-bold text-center" type="number"
              inputMode="decimal" placeholder="$0.00"
              value={precio} onChange={e=>setPrecio(e.target.value)}/>
          </div>
          {isAdmin && (
            <div>
              <label className="section-title">Costo (solo visible para ti)</label>
              <input className="input text-center" type="number"
                inputMode="decimal" placeholder="$0.00"
                value={costo} onChange={e=>setCosto(e.target.value)}/>
            </div>
          )}
        </div>
        <button onClick={add} className="btn-primary w-full">Agregar al carrito</button>
      </div>
    </div>
  )
}
