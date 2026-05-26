import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useDB } from '../../context/DBContext'
import { pNom } from '../../utils/products'

export default function StockAlerts() {
  const { db } = useDB()

    const agotados = useMemo(() =>
        (db.prods||[]).filter(p => p.stock===0 && p.stockBodega>0),
          [db.prods])

            const sinStock = useMemo(() =>
                (db.prods||[]).filter(p => p.stock<=0 && !p.stockBodega),
                  [db.prods])

                    if (!agotados.length && !sinStock.length) return null

                      return (
                          <div className="mx-4 mt-2 space-y-1.5">
                                {agotados.slice(0,3).map(p => (
                                        <div key={p.id} className="flex items-center gap-2 bg-gold-light border border-yellow-200 rounded-xl px-3 py-2">
                                                  <AlertTriangle size={14} className="text-gold flex-shrink-0"/>
                                                            <p className="text-xs font-medium text-gold truncate">
                                                                        {pNom(p)} — hay {p.stockBodega} en bodega
                                                                                  </p>
                                                                                          </div>
                                                                                                ))}
                                                                                                      {sinStock.length>0 && (
                                                                                                              <div className="flex items-center gap-2 bg-danger-light border border-red-200 rounded-xl px-3 py-2">
                                                                                                                        <AlertTriangle size={14} className="text-danger flex-shrink-0"/>
                                                                                                                                  <p className="text-xs font-medium text-danger">
                                                                                                                                              {sinStock.length} producto{sinStock.length!==1?'s':''} sin stock
                                                                                                                                                        </p>
                                                                                                                                                                </div>
                                                                                                                                                                      )}
                                                                                                                                                                          </div>
                                                                                                                                                                            )
                                                                                                                                                                            }