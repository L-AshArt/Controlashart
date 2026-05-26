import { createContext, useContext, useState } from 'react'
import { PIN_H, hashStr } from '../utils/firebase'
import { useDB } from './DBContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { db } = useDB()
    const [isAdmin, setIsAdmin]   = useState(false)
      const [unlocked, setUnlocked] = useState(false)
        const [pinError, setPinError] = useState(false)

          async function checkPin(pin) {
              const h = await hashStr(pin)
                  if (h === PIN_H) {
                        setIsAdmin(true); setUnlocked(true); return true
                            }
                                const empHash = db.cfg?.empPinHash || ''
                                    if (empHash && h === empHash) {
                                          setIsAdmin(false); setUnlocked(true); return true
                                              }
                                                  setPinError(true)
                                                      setTimeout(() => setPinError(false), 1500)
                                                          return false
                                                            }

                                                              function lock() { setUnlocked(false); setIsAdmin(false) }

                                                                return (
                                                                    <AuthContext.Provider value={{isAdmin,unlocked,pinError,checkPin,lock}}>
                                                                          {children}
                                                                              </AuthContext.Provider>
                                                                                )
                                                                                }

                                                                                export const useAuth = () => useContext(AuthContext)