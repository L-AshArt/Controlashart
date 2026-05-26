import { ShoppingBag, BookOpen, BarChart2, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { id:'venta',    label:'Venta',    Icon:ShoppingBag },
  { id:'catalogo', label:'Catálogo', Icon:BookOpen    },
  { id:'reportes', label:'Reportes', Icon:BarChart2   },
  { id:'config',   label:'Config',   Icon:Settings    },
]

export default function NavBar({ active, onChange }) {
  const { isAdmin } = useAuth()
  const tabs = isAdmin ? TABS : TABS.filter(t => t.id !== 'config')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,.06)]">
      <div className="flex">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              active===id ? 'text-rosa' : 'text-ink-3'
            }`}
          >
            <Icon size={22} strokeWidth={active===id ? 2.5 : 1.8}/>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
