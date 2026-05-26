export function largo(l) {
  if (!l || l === 'Mix') return 'Mix'
  if (l === 'custom') return 'Otro'
  return l + 'mm'
}

export function pNom(p) {
  const n = s => s + (p.notas ? ' · ' + p.notas : '')
  switch (p.tipo) {
    case 'clasica':
      return n(`${p.marca||'Nagaraku'} Clasica ${p.grosor} | ${p.curvaLabel} | ${p.largo==='custom'?(p.largoLabel||'Otro')+'mm':largo(p.largo)}`)
    case 'tec':
      return n(`${p.marca} Tec ${p.dimension==='custom'?p.dimensionLabel||'Otro':p.dimension} | ${p.curvaLabel} | ${p.largo==='custom'?(p.largoLabel||'Otro')+'mm':largo(p.largo)}`)
    case 'abanico':
      return n(`${p.marca} Ab ${p.dimension==='custom'?p.dimensionLabel||'Otro':p.dimension} | ${p.grosor} | ${p.curvaLabel} | ${p.largo==='custom'?(p.largoLabel||'Otro')+'mm':largo(p.largo)}`)
    case 'adhesivo': return n(`${p.marca} - ${p.nombre}`)
    case 'pinza':    return n(`${p.marca} - Pinza ${p.subtipo}`)
    default:         return n(p.nombre || '')
  }
}

export function marcaP(p) {
  return p.marca || (p.tipo === 'clasica' ? 'Nagaraku' : null)
}

export function grosorP(p) {
  if (p.tipo === 'clasica' || p.tipo === 'abanico') return p.grosor
  if (p.tipo === 'tec') return p.dimension === 'custom' ? p.dimensionLabel||'Otro' : p.dimension
  return null
}

export function tLabel(t) {
  return {
    clasica:'Fibra Clásica', tec:'Fibra Tec', abanico:'Abanico',
    adhesivo:'Adhesivo', pinza:'Pinza', insumo:'Insumo', otro:'Otro'
  }[t] || t
}

export function tColor(t) {
  return {
    clasica:'bg-purple-100 text-purple-700',
    tec:'bg-blue-100 text-blue-700',
    abanico:'bg-pink-100 text-pink-700',
    adhesivo:'bg-amber-100 text-amber-700',
    pinza:'bg-teal-100 text-teal-700',
    insumo:'bg-gray-100 text-gray-600',
    otro:'bg-gray-100 text-gray-600',
  }[t] || 'bg-gray-100 text-gray-600'
}

export function stockColor(stock) {
  if (stock <= 0) return 'text-danger'
  if (stock <= 5) return 'text-gold'
  return 'text-ok'
}

export function numSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true })
}

export function parseFecha(f) {
  if (!f) return new Date(0)
  const [d, m, y] = f.split('/').map(Number)
  return new Date(y, m - 1, d)
}
