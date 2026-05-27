import { useState } from 'react'
import { DBProvider }            from './context/DBContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FavoritosProvider }     from './context/FavoritosContext'
import { CartProvider, useCart } from './context/CartContext'
import { ToastProvider }         from './components/Layout/Toast'
import PinScreen                 from './components/PIN/PinScreen'
import NavBar                    from './components/Layout/NavBar'
import VentaScreen               from './components/Venta/VentaScreen'
import CatalogoScreen            from './components/Catalogo/CatalogoScreen'
import ReportesScreen            from './components/Reportes/ReportesScreen'
import ConfigScreen              from './components/Config/ConfigScreen'
import { useDB }                 from './context/DBContext'

function AppInner() {
  const { unlocked } = useAuth()
  const { db } = useDB()
  const { cartCount } = useCart()
  const [tab, setTab] = useState('venta')
  const count = cartCount(db.prods || [])

  if (!unlocked) return <PinScreen />

  return (
    <div className="min-h-screen bg-surface-bg pb-20">
      {tab === 'venta'    && <VentaScreen />}
      {tab === 'catalogo' && <CatalogoScreen />}
      {tab === 'reportes' && <ReportesScreen />}
      {tab === 'config'   && <ConfigScreen />}
      <NavBar active={tab} onChange={setTab} cartCount={count} />
    </div>
  )
}

export default function App() {
  return (
    <DBProvider>
      <AuthProvider>
        <FavoritosProvider>
          <CartProvider>
            <ToastProvider>
              <AppInner />
            </ToastProvider>
          </CartProvider>
        </FavoritosProvider>
      </AuthProvider>
    </DBProvider>
  )
}
