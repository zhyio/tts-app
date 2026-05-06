import { useState, useCallback } from "react"

interface UseProgressDragOptions {
  duration: number
  onSeek: (time: number) => void
  barRef: React.RefObject<HTMLDivElement | null>
}

interface UseProgressDragReturn {
  isDragging: boolean
  dragProgress: number
  handleBarClick: (e: React.MouseEvent) => void
  handleThumbMouseDown: (e: React.MouseEvent) => void
  handleThumbTouchStart: (e: React.TouchEvent) => void
}

export function useProgressDrag({
  duration,
  onSeek,
  barRef,
}: UseProgressDragOptions): UseProgressDragReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  const calculateProgress = useCallback(
    (clientX: number): number => {
      const bar = barRef.current
      if (!bar) return 0
      const rect = bar.getBoundingClientRect()
      const x = clientX - rect.left
      return Math.max(0, Math.min(1, x / rect.width))
    },
    [barRef]
  )

  const startDrag = useCallback(() => {
    setIsDragging(true)

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      setDragProgress(calculateProgress(e.clientX))
    }

    const handleMouseUp = (e: MouseEvent) => {
      const progress = calculateProgress(e.clientX)
      if (duration > 0) {
        onSeek(progress * duration)
      }
      setIsDragging(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }, [calculateProgress, duration, onSeek])

  const startTouchDrag = useCallback(() => {
    setIsDragging(true)

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      setDragProgress(calculateProgress(e.touches[0].clientX))
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const progress = calculateProgress(touch.clientX)
      if (duration > 0) {
        onSeek(progress * duration)
      }
      setIsDragging(false)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)
  }, [calculateProgress, duration, onSeek])

  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      if (duration <= 0) return
      const progress = calculateProgress(e.clientX)
      onSeek(progress * duration)
    },
    [calculateProgress, duration, onSeek]
  )

  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setDragProgress(calculateProgress(e.clientX))
      startDrag()
    },
    [calculateProgress, startDrag]
  )

  const handleThumbTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setDragProgress(calculateProgress(e.touches[0].clientX))
      startTouchDrag()
    },
    [calculateProgress, startTouchDrag]
  )

  return {
    isDragging,
    dragProgress,
    handleBarClick,
    handleThumbMouseDown,
    handleThumbTouchStart,
  }
}
