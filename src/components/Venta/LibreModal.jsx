import { useState } from 'react'
import { X } from 'lucide-react'
import { useToast } from '../Layout/Toast'

export default function LibreModal({ onClose, cart, setCart }) {
  const toast = useToast()
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')

  function add() {
    if (!nombre.trim() || !parseFloat(precio)) {
      toast('Completa nombre y precio', 'er'); return
    }
    const id = `libre_${Date.now()}`
    setCart(c => ({
      ...c,
      [id]: { qty: 1, libre: true, nombre: nombre.trim(), precio: parseFloat(precio) }
    }))
    toast('Agregado al carrito', 'ok')
    onClose()
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
            <label className="section-title">Descripción</label>
            <input className="input" placeholder="ej. Envío, descuento especial..."
              value={nombre} onChange={e=>setNombre(e.target.value)}/>
          </div>
          <div>
            <label className="section-title">Precio</label>
            <input className="input text-xl font-bold text-center" type="number"
              inputMode="decimal" placeholder="0.00"
              value={precio} onChange={e=>setPrecio(e.target.value)}/>
          </div>
        </div>
        <button onClick={add} className="btn-primary w-full">
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
