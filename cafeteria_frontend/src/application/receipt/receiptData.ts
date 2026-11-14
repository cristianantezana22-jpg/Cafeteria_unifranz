export type ReceiptItem = {
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type ReceiptData = {
  ticketCode: string
  date: string
  time: string
  items: ReceiptItem[]
  total: number
}

export function encodeReceiptData(data: ReceiptData) {
  const bytes = new TextEncoder().encode(JSON.stringify(data))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodeReceiptData(value: string): ReceiptData | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!isReceiptData(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function isReceiptData(value: unknown): value is ReceiptData {
  if (!value || typeof value !== 'object') return false
  const receipt = value as Partial<ReceiptData>
  return (
    typeof receipt.ticketCode === 'string' &&
    typeof receipt.date === 'string' &&
    typeof receipt.time === 'string' &&
    typeof receipt.total === 'number' &&
    Number.isFinite(receipt.total) &&
    Array.isArray(receipt.items) &&
    receipt.items.every((item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.name === 'string' &&
      typeof item.quantity === 'number' &&
      Number.isFinite(item.quantity) &&
      typeof item.unitPrice === 'number' &&
      Number.isFinite(item.unitPrice) &&
      typeof item.subtotal === 'number' &&
      Number.isFinite(item.subtotal),
    )
  )
}
