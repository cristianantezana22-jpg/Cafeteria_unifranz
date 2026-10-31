import { useEffect, useRef } from 'react'
import type { RealtimeHandlers } from '../../application/services/RealtimeGateway'
import { subscribeToRealtime } from '../../infrastructure/api/cafeteria'

export function useRealtimeEvents(handlers: RealtimeHandlers) {
  const latest = useRef(handlers)
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(
    () =>
      subscribeToRealtime({
        'orders-changed': () => latest.current['orders-changed']?.(),
        'products-changed': () => latest.current['products-changed']?.(),
        reconnected: () => latest.current.reconnected?.(),
      }),
    [],
  )
}