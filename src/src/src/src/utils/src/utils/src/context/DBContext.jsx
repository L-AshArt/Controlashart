import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fsGet, fsSet } from '../utils/firebase'

const KEYS = ['prods','ventas','cfg','cli','cups','proms','gastos']
const defaultDB = { prods:[],ventas:[],cfg:{},cli:{},cups:[],proms:[],gastos:[] }
const DBContext = createContext(null)

function lsGet(k) { try { return JSON.parse(localStorage.getItem('la_'+k)||'null') } catch { return null } }
function lsSet(k,v) { try { localStorage.setItem('la_'+k,JSON.stringify(v)) } catch {} }

export function DBProvider({ children }) {
  const [db, setDB]         = useState(defaultDB)
    const [synced, setSynced] = useState(false)
      const [online, setOnline] = useState(navigator.onLine)

        useEffect(() => {
            const local = {}
                KEYS.forEach(k => { const v=lsGet(k); if(v!==null)local[k]=v })
                    if (Object.keys(local).length) setDB(d=>({...d,...local}))
                        loadFromFirebase()
                            const id = setInterval(loadFromFirebase, 20000)
                                window.addEventListener('online',  ()=>setOnline(true))
                                    window.addEventListener('offline', ()=>setOnline(false))
                                        return () => clearInterval(id)
                                          }, [])

                                            async function loadFromFirebase() {
                                                try {
                                                      const results = await Promise.allSettled(KEYS.map(k=>fsGet(k)))
                                                            const updates = {}
                                                                  results.forEach((r,i) => {
                                                                          if (r.status==='fulfilled') { updates[KEYS[i]]=r.value; lsSet(KEYS[i],r.value) }
                                                                                })
                                                                                      if (Object.keys(updates).length) setDB(d=>({...d,...updates}))
                                                                                            setSynced(true)
                                                                                                } catch {}
                                                                                                  }

                                                                                                    const save = useCallback(async (key, value) => {
                                                                                                        lsSet(key, value)
                                                                                                            setDB(d=>({...d,[key]:value}))
                                                                                                                try { await fsSet(key, value) } catch {}
                                                                                                                  }, [])

                                                                                                                    const update = useCallback((key, updater) => {
                                                                                                                        setDB(d => {
                                                                                                                              const newVal = updater(d[key])
                                                                                                                                    lsSet(key, newVal)
                                                                                                                                          fsSet(key, newVal).catch(()=>{})
                                                                                                                                                return {...d,[key]:newVal}
                                                                                                                                                    })
                                                                                                                                                      }, [])

                                                                                                                                                        return (
                                                                                                                                                            <DBContext.Provider value={{db,save,update,synced,online}}>
                                                                                                                                                                  {children}
                                                                                                                                                                      </DBContext.Provider>
                                                                                                                                                                        )
                                                                                                                                                                        }

                                                                                                                                                                        export const useDB = () => useContext(DBContext)