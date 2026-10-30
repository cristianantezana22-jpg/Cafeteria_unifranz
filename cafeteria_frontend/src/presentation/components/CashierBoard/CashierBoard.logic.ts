import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type {
  CashierOrder,
  CashierProfile,
  OrderStatus,
} from '../../../domain/models'
import {
  getCurrentSession,
  getCashierOrders,
  getCashierProfile,
  logoutCashier,
  updateCashierOrderStatus,
} from '../../../infrastructure/api/cafeteria'
import { STATUS_LABELS } from '../CashierOrderCard/CashierOrderCard.logic'

export type BoardFilter = 'TODOS' | 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO'

export const FILTERS: { value: BoardFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE', label: STATUS_LABELS.PENDIENTE },
  { value: 'EN_PREPARACION', label: STATUS_LABELS.EN_PREPARACION },
  { value: 'LISTO', label: STATUS_LABELS.LISTO },
  { value: 'ENTREGADO', label: STATUS_LABELS.ENTREGADO },
]

const REFRESH_INTERVAL_MS = 10_000

export function useCashierBoard() {
  const navigate = useNavigate()
  const userName = getCurrentSession()?.customer.name ?? ''
  const [profile, setProfile] = useState<CashierProfile | null>(null)
  const [orders, setOrders] = useState<CashierOrder[]>([])
  const [filter, setFilter] = useState<BoardFilter>('TODOS')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const isMounted = useRef(true)

  function handleLogout() {
    logoutCashier()
    void navigate({ to: '/' })
  }

  const loadOrders = useCallback(async () => {
    try {
      const data = await getCashierOrders()
      if (!isMounted.current) return
      setOrders(data)
      setError('')
    } catch (loadError) {
      if (!isMounted.current) return
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar los pedidos.',
      )
    } finally {
      if (isMounted.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true

    getCashierProfile()
      .then((data) => {
        if (isMounted.current) setProfile(data)
      })
      .catch((profileError) => {
        if (!isMounted.current) return
        setError(
          profileError instanceof Error
            ? profileError.message
            : 'No se pudo cargar el perfil de caja.',
        )
      })

    void loadOrders()
    const timer = window.setInterval(() => void loadOrders(), REFRESH_INTERVAL_MS)

    return () => {
      isMounted.current = false
      window.clearInterval(timer)
    }
  }, [loadOrders])

  const changeStatus = useCallback(
    async (order: CashierOrder, status: OrderStatus) => {
      setUpdatingId(order.id)
      setError('')
      try {
        const updated = await updateCashierOrderStatus(order.id, status)
        setOrders((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        )
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : 'No se pudo actualizar el pedido.',
        )
        await loadOrders()
      } finally {
        setUpdatingId(null)
      }
    },
    [loadOrders],
  )

  function handleAdvance(order: CashierOrder) {
    if (order.nextStatus) void changeStatus(order, order.nextStatus)
  }

  function handleCancel(order: CashierOrder) {
    void changeStatus(order, 'CANCELADO')
  }

  const counts = useMemo(() => {
    const result: Record<BoardFilter, number> = {
      TODOS: orders.length,
      PENDIENTE: 0,
      EN_PREPARACION: 0,
      LISTO: 0,
      ENTREGADO: 0,
    }
    for (const order of orders) {
      if (order.status in result) result[order.status as BoardFilter] += 1
    }
    return result
  }, [orders])

  const visibleOrders = useMemo(
    () => (filter === 'TODOS' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  )

  return {
    userName,
    profile,
    filter,
    setFilter,
    counts,
    visibleOrders,
    isLoading,
    updatingId,
    error,
    handleAdvance,
    handleCancel,
    handleLogout,
    refresh: () => void loadOrders(),
  }
}
