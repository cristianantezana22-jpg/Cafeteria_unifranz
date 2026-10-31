import type { RealtimeGateway, RealtimeHandlers } from '../services/RealtimeGateway'

export function createSubscribeToRealtime(realtime: RealtimeGateway) {
  return (handlers: RealtimeHandlers) => realtime.subscribe(handlers)
}