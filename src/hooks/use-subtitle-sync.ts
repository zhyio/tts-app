import { useMemo } from "react"
import type { SubtitleSegment } from "@/services/subtitle-service"
import { findCurrentSegment } from "@/services/subtitle-service"

export function useSubtitleSync(
  segments: SubtitleSegment[],
  currentTime: number
): { currentText: string; currentIndex: number } {
  const currentIndex = useMemo(
    () => findCurrentSegment(segments, currentTime),
    [segments, currentTime]
  )

  const currentText = currentIndex >= 0 ? segments[currentIndex].text : ""

  return { currentText, currentIndex }
}
