export type RealtimeHandlers = {
  'orders-changed'?: () => void
  'products-changed'?: () => void
  reconnected?: () => void
}

export interface RealtimeGateway {
  subscribe: (handlers: RealtimeHandlers) => () => void
}