import { Wifi, WifiOff } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { useState } from 'react'

const LOGO = '/Controlashart/icon-180.png'

export default function Header({ title, right }) {
  const { online, synced } = useDB()
  const [imgErr, setImgErr] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-rosa flex items-center justify-center overflow-hidden shadow-sm">
          {imgErr
            ? <span className="font-serif text-sm text-white font-semibold">LA</span>
            : <img src={LOGO} alt="logo" className="w-full h-full object-cover" onError={()=>setImgErr(true)}/>
          }
        </div>
        <div>
          <h1 className="text-base font-bold text-ink leading-none">{title}</h1>
          <div className="flex items-center gap-1 mt-0.5">
            {online ? <Wifi size={10} className="text-ok"/> : <WifiOff size={10} className="text-danger"/>}
            <span className={`text-[10px] font-medium ${online?'text-ok':'text-danger'}`}>
              {online ? (synced?'Sincronizado':'Conectado') : 'Sin conexion'}
            </span>
          </div>
        </div>
      </div>
      {right && <div>{right}</div>}
    </header>
  )
}
