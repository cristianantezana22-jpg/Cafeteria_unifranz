import { useEffect, useRef } from 'react'

export function useIdleTimeout(
  onIdle: () => void,
  timeout = 30_000,
  enabled = true,
) {
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  useEffect(() => {
    if (!enabled) return

    let timer: ReturnType<typeof setTimeout> | undefined

    const resetTimer = () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = setTimeout(() => onIdleRef.current(), timeout)
    }

    document.addEventListener('click', resetTimer)
    document.addEventListener('touchstart', resetTimer, { passive: true })
    resetTimer()

    return () => {
      if (timer !== undefined) clearTimeout(timer)
      document.removeEventListener('click', resetTimer)
      document.removeEventListener('touchstart', resetTimer)
    }
  }, [enabled, timeout])
}
