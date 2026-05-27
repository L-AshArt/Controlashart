import { createContext, useContext, useState } from 'react'

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({})
  const [priceOverrides, setPriceOverrides] = useState({})

  function setOverride(prodId, price) {
    setPriceOverrides(p => ({ ...p, [prodId]: price }))
  }

  function clearOverrides() {
    setPriceOverrides({})
  }

  function getPrice(prod) {
    return priceOverrides[prod.id] ?? prod.precioMenudeo
  }

  const cartItems = (prods) => {
    return Object.entries(cart).map(([id, val]) => {
      if (typeof val === 'object' && val.libre) {
        return { prod: { id, precioMenudeo: val.precio, nombre: val.nombre, stock: 999, tipo: 'libre' }, qty: val.qty }
      }
      const p = prods.find(x => x.id === Number(id))
      return p ? { prod: { ...p, precioMenudeo: priceOverrides[p.id] ?? p.precioMenudeo }, qty: val } : null
    }).filter(Boolean)
  }

  function addToCart(prod) {
    if (prod.stock <= 0) return
    setCart(c => {
      const current = c[prod.id] || 0
      if (current >= prod.stock) return c  // can't exceed stock
      return { ...c, [prod.id]: current + 1 }
    })
  }

  function remFromCart(prod) {
    setCart(c => {
      const n = (c[prod.id] || 0) - 1
      if (n <= 0) { const nc = { ...c }; delete nc[prod.id]; return nc }
      return { ...c, [prod.id]: n }
    })
  }

  function clearCart() { setCart({}); setPriceOverrides({}) }

  const cartCount = (prods) => cartItems(prods).reduce((s, { qty }) => s + qty, 0)
  const cartTotal = (prods) => cartItems(prods).reduce((s, { prod, qty }) => s + (prod.precioMenudeo || 0) * qty, 0)

  return (
    <CartCtx.Provider value={{ cart, setCart, cartItems, addToCart, remFromCart, clearCart, cartCount, cartTotal, priceOverrides, setOverride, clearOverrides, getPrice }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)
