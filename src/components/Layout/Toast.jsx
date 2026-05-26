import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type='ok') => {
    const id = Date.now()
    setToasts(t => [...t, {id,msg,type}])
    setTimeout(() => setToasts(t => t.filter(x=>x.id!==id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col gap-2 px-4 pointer-events-none">
        {toasts.map(({id,msg,type}) => (
          <div key={id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-card-lg text-sm font-medium ${
            type==='ok' ? 'bg-ok-light text-ok border border-green-200' :
            type==='er' ? 'bg-danger-light text-danger border border-red-200' :
                          'bg-white text-ink border border-gray-200'
          }`}>
            {type==='ok' ? <CheckCircle size={16}/> :
             type==='er' ? <XCircle size={16}/> :
                           <Info size={16}/>}
            {msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
