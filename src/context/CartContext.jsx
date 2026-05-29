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

  const cartItems = (prods, mayoreoRules) => {
    // First pass: build items with qty
    const raw = Object.entries(cart).map(([id, val]) => {
      const p = (prods||[]).find(x => String(x.id) === String(id))
      if (!p) return null
      const qty = typeof val === 'number' ? val : 1
      return { prod: p, qty }
    }).filter(Boolean)

    // Count total qty per category (tipo + marca)
    const catQty = {}
    raw.forEach(({ prod, qty }) => {
      const cat = (prod.tipo || 'otro') + '|' + (prod.marca || '')
      catQty[cat] = (catQty[cat] || 0) + qty
    })

    // Get mayoreo rules from passed param
    const reglas = mayoreoRules || []

    // Find applicable rule for a product
    function getRegla(prod) {
      const tipo = prod.tipo || 'otro'
      const marca = prod.marca || ''
      // Specific marca rule takes priority
      const specific = reglas.find(r => r.tipo === tipo && r.marca === marca)
      if (specific) return specific
      // Fallback to "todas" rule
      return reglas.find(r => r.tipo === tipo && r.marca === 'todas')
    }

    // Second pass: apply prices
    return raw.map(({ prod, qty }) => {
      const override = priceOverrides[prod.id]
      const cat = (prod.tipo || 'otro') + '|' + (prod.marca || '')
      const totalCat = catQty[cat] || 0
      const regla = getRegla(prod)
      // Mayoreo from Config rules OR per-product minMayoreo
      const autoMay = !override && prod.precioMayoreo > 0 && (
        (regla && totalCat >= regla.minPiezas) ||
        (!regla && prod.minMayoreo > 0 && totalCat >= prod.minMayoreo)
      )
      const precio = override ?? (autoMay ? prod.precioMayoreo : prod.precioMenudeo)
      return { prod: { ...prod, precioMenudeo: precio, _mayoreo: autoMay }, qty }
    })
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

  const cartCount = (prods, rules) =>
    cartItems(prods, rules).reduce((s, { qty }) => s + qty, 0)
    + libres.reduce((s, l) => s + l.qty, 0)

  const cartTotal = (prods, rules) =>
    cartItems(prods, rules).reduce((s, { prod, qty }) => s + (prod.precioMenudeo || 0) * qty, 0)
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
