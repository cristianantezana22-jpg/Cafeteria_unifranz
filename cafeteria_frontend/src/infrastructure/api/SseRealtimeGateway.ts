import type { RealtimeGateway, RealtimeHandlers } from '../../application/services/RealtimeGateway'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '')

export class SseRealtimeGateway implements RealtimeGateway {
  subscribe(handlers: RealtimeHandlers) {
    const source = new EventSource(`${API_BASE_URL}/api/stream/events`)
    let hasOpened = false

    source.addEventListener('connected', () => {
      if (hasOpened) handlers.reconnected?.()
      hasOpened = true
    })
    source.addEventListener('orders-changed', () => handlers['orders-changed']?.())
    source.addEventListener('products-changed', () => handlers['products-changed']?.())

    return () => source.close()
  }
}