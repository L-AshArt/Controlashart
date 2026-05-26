const FS_KEY = 'AIzaSyCK-S5hDwRTPDlGVh1SKiRp9BTiea6MJeI'
const FS_PRJ = 'lashart-b86d4'
const FS_COL = 'lashArt'
const BASE   = `https://firestore.googleapis.com/v1/projects/${FS_PRJ}/databases/(default)/documents/${FS_COL}`

export async function fsGet(doc) {
  const r = await fetch(`${BASE}/${doc}?key=${FS_KEY}`)
  const d = await r.json()
  const s = d.fields?.d?.stringValue
  if (!s) throw new Error('empty')
  return JSON.parse(s)
}

export async function fsSet(doc, value) {
  const body = { fields: { d: { stringValue: JSON.stringify(value) } } }
  await fetch(`${BASE}/${doc}?key=${FS_KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export const PIN_H = '8cfecd937a9328ecb71d3c08e5dd312058ca7d75171e7ba6e3af7573e210cd6c'

export async function hashStr(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
