import type { RealtimeGateway, RealtimeHandlers } from '../../application/services/RealtimeGateway'

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL
  if (typeof configured === 'string' && configured.trim() !== '') {
    return configured.replace(/\/+$/, '')
  }
  const hostname =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : '127.0.0.1'
  const protocol =
    typeof window !== 'undefined' && window.location.protocol
      ? window.location.protocol
      : 'http:'
  return `${protocol}//${hostname}:8080`
}

export class SseRealtimeGateway implements RealtimeGateway {
  subscribe(handlers: RealtimeHandlers) {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const source = new EventSource(`${resolveApiBaseUrl()}/api/stream/events`)
    let hasOpened = false

    source.addEventListener('connected', () => {
      if (hasOpened) handlers.reconnected?.()
      hasOpened = true
    })
    source.addEventListener('orders-changed', () => handlers['orders-changed']?.())
    source.addEventListener('products-changed', () => handlers['products-changed']?.())
    source.onerror = () => {}

    return () => source.close()
  }
}
