import { useState } from 'react'
import { Delete } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LOGO = '/Controlashart/icon-180.png'

export default function PinScreen() {
  const { checkPin, pinError } = useAuth()
  const [pin, setPin] = useState('')
  const [imgErr, setImgErr] = useState(false)

  async function press(d) {
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      const ok = await checkPin(next)
      if (!ok) setPin('')
    }
  }

  function del() { setPin(p => p.slice(0,-1)) }
  const keys = ['1','2','3','4','5','6','7','8','9','','0','x']

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-8 select-none">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-rosa mx-auto flex items-center justify-center mb-3 overflow-hidden shadow-lg">
          {imgErr
            ? <span className="font-serif text-2xl text-white font-semibold">LA</span>
            : <img src={LOGO} alt="logo" className="w-full h-full object-cover" onError={()=>setImgErr(true)}/>
          }
        </div>
        <h1 className="font-serif text-2xl text-white font-semibold">L-Ash Art</h1>
        <p className="text-ink-3 text-sm mt-1">Ingresa tu PIN para continuar</p>
      </div>

      <div className="flex gap-4 mb-10">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-150 ${
            i < pin.length ? 'bg-rosa scale-110' : 'bg-ink-2'
          }`}/>
        ))}
      </div>

      {pinError && <p className="text-danger text-sm mb-4 animate-pulse">PIN incorrecto</p>}

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {keys.map((k,i) => (
          <button key={i}
            onClick={() => k==='x' ? del() : k!=='' ? press(k) : null}
            disabled={k===''}
            className={`h-16 rounded-xl2 text-xl font-semibold transition-all active:scale-95 ${
              k==='' ? 'invisible' :
              k==='x' ? 'bg-transparent text-ink-3' :
              'bg-white/10 text-white hover:bg-white/20'
            }`}>
            {k==='x' ? <Delete className="mx-auto" size={22}/> : k}
          </button>
        ))}
      </div>
    </div>
  )
}
