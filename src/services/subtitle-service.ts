export interface SubtitleSegment {
  text: string
  startTime: number
  endTime: number
}

const SENTENCE_SPLIT_RE = /[。！？.!?\n]+/
const SUB_SPLIT_RE = /[，；、,;]/

function splitIntoSegments(text: string): string[] {
  const raw = text.split(SENTENCE_SPLIT_RE).map((s) => s.trim()).filter(Boolean)
  const result: string[] = []

  for (const segment of raw) {
    if (segment.length <= 80) {
      result.push(segment)
    } else {
      const subParts = segment.split(SUB_SPLIT_RE).map((s) => s.trim()).filter(Boolean)
      let current = ""
      for (const part of subParts) {
        if (current.length + part.length > 80 && current) {
          result.push(current)
          current = part
        } else {
          current = current ? `${current}，${part}` : part
        }
      }
      if (current) result.push(current)
    }
  }

  // If still no segments (text with no sentence boundaries), split at ~40 chars
  if (result.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += 40) {
      result.push(text.slice(i, i + 40))
    }
  }

  return result
}

export function generateEstimatedSubtitles(
  fullText: string,
  totalDuration: number
): SubtitleSegment[] {
  const segments = splitIntoSegments(fullText)
  if (segments.length === 0) return []

  // If duration is unknown (0), return segments with zero timing
  // They'll be rescaled later when duration becomes available
  if (totalDuration <= 0) {
    return segments.map((text) => ({
      text,
      startTime: 0,
      endTime: 0,
    }))
  }

  const totalChars = segments.reduce((sum, s) => sum + s.length, 0)
  const charDuration = totalDuration / totalChars
  const MIN_SEGMENT_DURATION = 0.5

  const result: SubtitleSegment[] = []
  let currentOffset = 0

  for (const text of segments) {
    const rawDuration = text.length * charDuration
    const duration = Math.max(rawDuration, MIN_SEGMENT_DURATION)
    result.push({
      text,
      startTime: currentOffset,
      endTime: currentOffset + duration,
    })
    currentOffset += duration
  }

  // Adjust last segment to end exactly at totalDuration
  if (result.length > 0) {
    const last = result[result.length - 1]
    last.endTime = totalDuration
  }

  return result
}

export function rescaleSubtitles(
  segments: SubtitleSegment[],
  totalDuration: number
): SubtitleSegment[] {
  if (totalDuration <= 0 || segments.length === 0) return segments
  return generateEstimatedSubtitles(
    segments.map((s) => s.text).join("。"),
    totalDuration
  )
}

export function findCurrentSegment(
  segments: SubtitleSegment[],
  currentTime: number
): number {
  if (segments.length === 0) return -1

  // Binary search for the segment containing currentTime
  let lo = 0
  let hi = segments.length - 1

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const seg = segments[mid]

    if (currentTime < seg.startTime) {
      hi = mid - 1
    } else if (currentTime > seg.endTime) {
      lo = mid + 1
    } else {
      return mid
    }
  }

  // Between segments — return the one that just ended
  return Math.max(0, hi)
}
