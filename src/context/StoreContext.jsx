import { createContext, useContext, useState, useEffect } from 'react'

const PRODS_URL = 'https://firestore.googleapis.com/v1/projects/lashart-b86d4/databases/(default)/documents/lashArt/prods'
const Ctx = createContext(null)

// Construye nombre legible según el tipo de producto
function buildNombre(p) {
  const marca = p.marca ? `${p.marca} ` : ''
  const notas = p.notas ? ` (${p.notas})` : ''
  switch (p.tipo) {
    case 'clasica':  return `${marca}Clásica ${p.grosor}mm Curva ${p.curva} ${p.largo}${notas}`.trim()
    case 'tec':      return `${marca}Tec ${p.dimension||p.dimensionLabel||''} Curva ${p.curva} ${p.largo}${notas}`.trim()
    case 'abanico':  return `${marca}Abanico ${p.dimension||''} ${p.grosor}mm Curva ${p.curva}${notas}`.trim()
    case 'adhesivo': return `${marca}${p.nombre||''}${notas}`.trim()
    case 'pinza':    return `${marca}${p.subtipo||''}${notas}`.trim()
    default:         return (p.nombre || p.subtipo || `Producto ${p.id}`) + notas
  }
}

// Mapea tipo → categoría legible para la tienda
function buildCategoria(p) {
  const map = {
    clasica:  'Pestañas Clásicas',
    tec:      'Tecnológicas',
    abanico:  'Abanico',
    adhesivo: 'Adhesivos',
    pinza:    'Pinzas',
    insumo:   'Insumos',
    otro:     'Otros',
  }
  return map[p.tipo] || p.tipo
}

// Descripción automática
function buildDescripcion(p) {
  const parts = []
  if (p.grosor)    parts.push(`Grosor ${p.grosor}mm`)
  if (p.curva)     parts.push(`Curva ${p.curva}`)
  if (p.largo && p.largo !== 'Mix') parts.push(`Largo ${p.largo}mm`)
  if (p.largo === 'Mix')            parts.push('Largos mixtos')
  if (p.dimension) parts.push(`${p.dimension}`)
  if (p.marca)     parts.push(`Marca ${p.marca}`)
  if (p.notas)     parts.push(p.notas)
  return parts.join(' · ')
}

// Transforma cada producto del POS al formato de la tienda
function transformProduct(p) {
  return {
    id:           String(p.id),
    nombre:       buildNombre(p),
    categoria:    buildCategoria(p),
    precio:       Number(p.precioMenudeo || 0),
    precio_mayoreo: Number(p.precioMayoreo || 0),
    min_mayoreo:  Number(p.minMayoreo || 0),
    stock:        Number(p.stock || 0),
    imagen:       p.imagen || '',
    descripcion:  buildDescripcion(p),
    tipo:         p.tipo,
    marca:        p.marca || '',
    store_visible: p.store_visible !== false,
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res  = await fetch(PRODS_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const doc  = await res.json()
      const raw  = JSON.parse(doc.fields.d.stringValue)
      const mapped = raw
        .map(transformProduct)
        .filter(p => p.precio > 0)  // Solo productos con precio
      setProducts(mapped)
    } catch (e) {
      console.error('StoreContext error:', e)
      setError(e.message)
      setProducts(DEMO)
    } finally {
      setLoading(false)
    }
  }

  const getCategories = () => [...new Set(products.map(p => p.categoria).filter(Boolean))]
  const getByCategory = (cat) => cat ? products.filter(p => p.categoria === cat) : products
  const getById       = (id)  => products.find(p => p.id === id)

  return (
    <Ctx.Provider value={{ products, loading, error, getCategories, getByCategory, getById, refetch: fetchProducts }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)

// Demo mientras carga / si hay error
const DEMO = [
  { id:'d1', nombre:'Clásica 0.07mm Curva D Mix', categoria:'Pestañas Clásicas', precio:70, precio_mayoreo:60, min_mayoreo:5, stock:4, imagen:'', descripcion:'Grosor 0.07mm · Curva D · Largos mixtos', store_visible:true },
  { id:'d2', nombre:'Golle Negro',                 categoria:'Adhesivos',          precio:250,precio_mayoreo:0,  min_mayoreo:0, stock:2, imagen:'', descripcion:'Marca Golle', store_visible:true },
  { id:'d3', nombre:'L-Ash Art Curva (Rosa)',       categoria:'Pinzas',             precio:150,precio_mayoreo:0,  min_mayoreo:0, stock:4, imagen:'', descripcion:'Marca L-Ash Art · Curva · Rosa', store_visible:true },
  { id:'d4', nombre:'Tec 5D Curva D Mix',           categoria:'Tecnológicas',       precio:300,precio_mayoreo:0,  min_mayoreo:0, stock:4, imagen:'', descripcion:'5D · Curva D · Largos mixtos', store_visible:true },
]
