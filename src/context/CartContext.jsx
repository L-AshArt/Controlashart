import { createContext, useContext, useState } from 'react'

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart]               = useState({})
  const [priceOverrides, setPriceOverrides] = useState({})
  const [libres, setLibres]           = useState([])

  function addLibre(item) {
    setLibres(ls => {
      const ex = ls.find(l => l.id === item.id)
      if (ex) return ls.map(l => l.id===item.id ? {...l, qty: l.qty+1} : l)
      return [...ls, { ...item, qty: 1 }]
    })
  }

  function remLibre(id) {
    setLibres(ls => {
      const ex = ls.find(l => l.id === id)
      if (!ex) return ls
      if (ex.qty <= 1) return ls.filter(l => l.id !== id)
      return ls.map(l => l.id===id ? {...l, qty: l.qty-1} : l)
    })
  }

  function setOverride(prodId, price) {
    setPriceOverrides(p => ({ ...p, [prodId]: price }))
  }

  function clearOverrides() { setPriceOverrides({}) }

  function getPrice(prod) {
    return priceOverrides[prod.id] ?? prod.precioMenudeo
  }

  const cartItems = (prods) => {
    return Object.entries(cart).map(([id, val]) => {
      const p = (prods||[]).find(x => String(x.id) === String(id))
      if (!p) return null
      const qty      = typeof val === 'number' ? val : 1
      const override = priceOverrides[p.id]
      const autoMay  = !override && p.minMayoreo > 0 && p.precioMayoreo > 0 && qty >= p.minMayoreo
      const precio   = override ?? (autoMay ? p.precioMayoreo : p.precioMenudeo)
      return { prod: { ...p, precioMenudeo: precio, _mayoreo: autoMay }, qty }
    }).filter(Boolean)
  }

  function addToCart(prod) {
    if ((prod.stock ?? 0) <= 0) return
    setCart(c => {
      const cur = c[prod.id] || 0
      if (cur >= prod.stock) return c
      return { ...c, [prod.id]: cur + 1 }
    })
  }

  function remFromCart(prod) {
    setCart(c => {
      const n = (c[prod.id] || 0) - 1
      if (n <= 0) { const nc = { ...c }; delete nc[prod.id]; return nc }
      return { ...c, [prod.id]: n }
    })
  }

  function clearCart() {
    setCart({})
    setPriceOverrides({})
    setLibres([])
  }

  const cartCount = (prods) =>
    cartItems(prods).reduce((s, { qty }) => s + qty, 0)
    + libres.reduce((s, l) => s + l.qty, 0)

  const cartTotal = (prods) =>
    cartItems(prods).reduce((s, { prod, qty }) => s + (prod.precioMenudeo || 0) * qty, 0)
    + libres.reduce((s, l) => s + l.precio * l.qty, 0)

  return (
    <CartCtx.Provider value={{
      cart, setCart, cartItems, addToCart, remFromCart, clearCart,
      cartCount, cartTotal, priceOverrides, setOverride, clearOverrides, getPrice,
      libres, addLibre, remLibre
    }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)
