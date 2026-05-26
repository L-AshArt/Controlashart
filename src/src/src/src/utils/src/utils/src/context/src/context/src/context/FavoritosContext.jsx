import { createContext, useContext, useState } from 'react'

const FavCtx = createContext(null)

export function FavoritosProvider({ children }) {
  const [favs, setFavs] = useState(() => {
      try { return JSON.parse(localStorage.getItem('la_favs')||'[]') } catch { return [] }
        })

          function toggle(prodId) {
              setFavs(f => {
                    const next = f.includes(prodId)
                            ? f.filter(x => x !== prodId)
                                    : [...f, prodId]
                                          localStorage.setItem('la_favs', JSON.stringify(next))
                                                return next
                                                    })
                                                      }

                                                        const isFav = (id) => favs.includes(id)

                                                          return (
                                                              <FavCtx.Provider value={{favs,toggle,isFav}}>
                                                                    {children}
                                                                        </FavCtx.Provider>
                                                                          )
                                                                          }

                                                                          export const useFavoritos = () => useContext(FavCtx)