import { ShoppingBag, BookOpen, BarChart2, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { id:'venta',    label:'Venta',    Icon:ShoppingBag },
  { id:'catalogo', label:'Catálogo', Icon:BookOpen    },
  { id:'reportes', label:'Reportes', Icon:BarChart2   },
  { id:'config',   label:'Config',   Icon:Settings    },
]

export default function NavBar({ active, onChange, cartCount=0 }) {
  const { isAdmin } = useAuth()
  const tabs = isAdmin ? TABS : TABS.filter(t => t.id !== 'config')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,.06)]">
      <div className="flex">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors relative ${
              active===id ? 'text-rosa' : 'text-ink-3'
            }`}>
            <div className="relative">
              <Icon size={22} strokeWidth={active===id ? 2.5 : 1.8}/>
              {id==='venta' && cartCount>0 && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rosa flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{cartCount}</span>
                </div>
              )}
            </div>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
