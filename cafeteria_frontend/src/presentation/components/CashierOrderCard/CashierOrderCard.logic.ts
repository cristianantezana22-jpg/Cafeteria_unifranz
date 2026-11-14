import type { CashierOrder, OrderStatus } from '../../../domain/models'
import type { IconName } from '../Icon/Icon.logic'

export type CashierOrderCardProps = {
  order: CashierOrder
  isUpdating: boolean
  onAdvance: (order: CashierOrder) => void
  onDeliverDirect: (order: CashierOrder) => void
  onCancel: (order: CashierOrder) => void
}

export const STATUS_FLOW: OrderStatus[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'LISTO',
  'ENTREGADO',
]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: 'Confirmando pago',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo para recoger',
  ENTREGADO: 'Completado',
  CANCELADO: 'Pago rechazado',
}

export const STATUS_ICONS: Record<OrderStatus, IconName> = {
  PENDIENTE: 'wallet',
  EN_PREPARACION: 'flame',
  LISTO: 'bell',
  ENTREGADO: 'check',
  CANCELADO: 'x',
}

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  EN_PREPARACION: 'Confirmar pago',
  LISTO: 'Marcar listo',
  ENTREGADO: 'Entregar pedido',
}

export function esOrigenPantalla(origin: string) {
  return origin === 'PANTALLA_TACTIL'
}

export function getStatusSteps(orderStatus: OrderStatus) {
  const currentStep = STATUS_FLOW.indexOf(orderStatus)
  return STATUS_FLOW.map((status, index) => ({
    status,
    label: STATUS_LABELS[status],
    isDone: currentStep >= 0 && index <= currentStep,
    isCurrent: index === currentStep,
  }))
}

export function getCardDetails(order: CashierOrder) {
  const currentStep = STATUS_FLOW.indexOf(order.status)
  const origenPantalla = esOrigenPantalla(order.origin)
  const canAct = order.isEditable && order.nextStatus !== null
  const lockedByBlock = !order.isEditable && order.nextStatus !== null
  const canDeliverDirect =
    origenPantalla && order.isEditable && order.status === 'PENDIENTE'
  const actionLabel =
    origenPantalla && order.nextStatus === 'ENTREGADO'
      ? STATUS_LABELS.ENTREGADO
      : order.nextStatus
        ? (ACTION_LABELS[order.nextStatus] ?? '')
        : ''
  const steps = origenPantalla
    ? [
        {
          status: 'PENDIENTE' as OrderStatus,
          label: STATUS_LABELS.PENDIENTE,
          isDone: order.status !== 'PENDIENTE' && order.status !== 'CANCELADO',
          isCurrent: order.status === 'PENDIENTE',
          isSkipped: false,
        },
        {
          status: 'ENTREGADO' as OrderStatus,
          label: STATUS_LABELS.ENTREGADO,
          isDone: order.status === 'ENTREGADO',
          isCurrent: order.status === 'ENTREGADO',
          isSkipped: false,
        },
      ]
    : STATUS_FLOW.map((status, index) => ({
        status,
        label: STATUS_LABELS[status],
        isDone: currentStep >= 0 && index <= currentStep,
        isCurrent: index === currentStep,
        isSkipped: false,
      }))

  return {
    statusLabel: STATUS_LABELS[order.status],
    statusIcon: STATUS_ICONS[order.status],
    steps,
    stepsCompact: origenPantalla,
    actionLabel,
    deliverDirectLabel: STATUS_LABELS.ENTREGADO,
    canAdvance: canAct,
    canDeliverDirect,
    canCancel: canAct && order.isCancellable,
    lockedByBlock,
    formattedTotal: `Bs ${order.total.toFixed(2)}`,
    formattedTime: new Intl.DateTimeFormat('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(order.createdAt)),
    paymentLabel: order.paymentMethod ?? 'SIN PAGO',
  }
}
