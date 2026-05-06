import { useRef } from "react"
import { useProgressDrag } from "@/hooks/use-progress-drag"
import { formatTime } from "@/lib/format-time"

interface ProgressBarProps {
  currentTime: number
  duration: number
  bufferedRanges?: { start: number; end: number }[]
  onSeek: (time: number) => void
}

export function ProgressBar({ currentTime, duration, bufferedRanges, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)

  const { isDragging, dragProgress, handleBarClick, handleThumbMouseDown, handleThumbTouchStart } =
    useProgressDrag({
      duration,
      onSeek,
      barRef,
    })

  const progress = isDragging
    ? dragProgress
    : duration > 0
      ? currentTime / duration
      : 0

  const displayTime = isDragging ? dragProgress * duration : currentTime

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
        {formatTime(displayTime)}
      </span>

      <div
        ref={barRef}
        className="group relative flex h-6 flex-1 cursor-pointer items-center"
        onClick={handleBarClick}
      >
        {/* Track */}
        <div className="relative h-1 w-full rounded-full bg-white/10 transition-all duration-200 group-hover:h-1.5">
          {/* Buffered ranges */}
          {bufferedRanges?.map((range, i) => (
            <div
              key={i}
              className="absolute top-0 h-full rounded-full bg-white/15"
              style={{
                left: `${duration > 0 ? (range.start / duration) * 100 : 0}%`,
                width: `${duration > 0 ? ((range.end - range.start) / duration) * 100 : 0}%`,
              }}
            />
          ))}

          {/* Filled */}
          <div
            className="absolute top-0 h-full rounded-full bg-primary transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100"
          style={{ left: `${progress * 100}%` }}
          onMouseDown={handleThumbMouseDown}
          onTouchStart={handleThumbTouchStart}
        >
          <div className="h-3.5 w-3.5 rounded-full bg-white shadow-lg shadow-black/30" />
        </div>
      </div>

      <span className="w-10 text-xs tabular-nums text-muted-foreground">
        {formatTime(duration)}
      </span>
    </div>
  )
}
