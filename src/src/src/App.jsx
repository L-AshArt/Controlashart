import { useState } from 'react'
import { DBProvider }            from './context/DBContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FavoritosProvider }     from './context/FavoritosContext'
import { ToastProvider }         from './components/Layout/Toast'
import PinScreen                 from './components/PIN/PinScreen'
import NavBar                    from './components/Layout/NavBar'
import VentaScreen               from './components/Venta/VentaScreen'
import CatalogoScreen            from './components/Catalogo/CatalogoScreen'
import ReportesScreen            from './components/Reportes/ReportesScreen'
import ConfigScreen              from './components/Config/ConfigScreen'

function AppInner() {
  const { unlocked } = useAuth()
    const [tab, setTab] = useState('venta')

      if (!unlocked) return <PinScreen />

        return (
            <div className="min-h-screen bg-surface-bg pb-20">
                  {tab === 'venta'    && <VentaScreen />}
                        {tab === 'catalogo' && <CatalogoScreen />}
                              {tab === 'reportes' && <ReportesScreen />}
                                    {tab === 'config'   && <ConfigScreen />}
                                          <NavBar active={tab} onChange={setTab} />
                                              </div>
                                                )
                                                }

                                                export default function App() {
                                                  return (
                                                      <DBProvider>
                                                            <AuthProvider>
                                                                    <FavoritosProvider>
                                                                              <ToastProvider>
                                                                                          <AppInner />
                                                                                                    </ToastProvider>
                                                                                                            </FavoritosProvider>
                                                                                                                  </AuthProvider>
                                                                                                                      </DBProvider>
                                                                                                                        )
                                                                                                                        }o