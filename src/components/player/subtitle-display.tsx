import { useMemo } from "react"
import type { SubtitleSegment } from "@/services/subtitle-service"
import { useSubtitleSync } from "@/hooks/use-subtitle-sync"

interface SubtitleDisplayProps {
  segments: SubtitleSegment[]
  currentTime: number
  duration: number
}

export function SubtitleDisplay({
  segments,
  currentTime,
  duration,
}: SubtitleDisplayProps) {
  const { currentIndex } = useSubtitleSync(segments, currentTime)

  // Build a display of all segments with the current one highlighted
  const segmentDisplay = useMemo(() => {
    if (segments.length === 0 || duration <= 0) return null

    return (
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {segments.map((seg, i) => (
          <span
            key={i}
            className={`transition-all duration-300 ${
              i === currentIndex
                ? "text-foreground opacity-100"
                : i < currentIndex
                  ? "text-muted-foreground opacity-40"
                  : "text-muted-foreground opacity-60"
            }`}
          >
            {seg.text}
          </span>
        ))}
      </div>
    )
  }, [segments, currentIndex, duration])

  if (segments.length === 0 || duration <= 0) {
    return null
  }

  return (
    <div className="glass-subtle rounded-xl px-5 py-4">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        字幕
      </p>
      {segmentDisplay}
    </div>
  )
}
