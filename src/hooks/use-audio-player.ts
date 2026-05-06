import { useState, useRef, useCallback, useEffect } from "react"

interface BufferedRange {
  start: number
  end: number
}

interface UseAudioPlayerReturn {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  volume: number
  bufferedRanges: BufferedRange[]
  loadAudio: (url: string) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef(new Audio())
  const rafRef = useRef<number>(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([])

  const updateBufferedRanges = useCallback(() => {
    const audio = audioRef.current
    const ranges: BufferedRange[] = []
    for (let i = 0; i < audio.buffered.length; i++) {
      ranges.push({ start: audio.buffered.start(i), end: audio.buffered.end(i) })
    }
    setBufferedRanges(ranges)
  }, [])

  const startRafLoop = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const stopRafLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    const onLoadedMetadata = () => setDuration(audio.duration)
    const onCanPlay = () => setIsLoading(false)
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => {
      setIsPlaying(true)
      setIsLoading(false)
      startRafLoop()
    }
    const onPause = () => {
      setIsPlaying(false)
      stopRafLoop()
    }
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      stopRafLoop()
    }
    const onError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      stopRafLoop()
    }

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("playing", onPlaying)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)
    audio.addEventListener("progress", updateBufferedRanges)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("playing", onPlaying)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("progress", updateBufferedRanges)
      stopRafLoop()
      audio.pause()
      audio.src = ""
    }
  }, [startRafLoop, stopRafLoop, updateBufferedRanges])

  const loadAudio = useCallback((url: string) => {
    const audio = audioRef.current
    audio.pause()
    audio.src = url
    audio.load()
    setIsLoading(true)
    setCurrentTime(0)
    setDuration(0)
    setBufferedRanges([])
  }, [])

  const play = useCallback(() => {
    audioRef.current.play().catch(() => {
      // Autoplay blocked or other error
    })
  }, [])

  const pause = useCallback(() => {
    audioRef.current.pause()
  }, [])

  const togglePlayPause = useCallback(() => {
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    audioRef.current.volume = clamped
    setVolumeState(clamped)
  }, [])

  return {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    volume,
    bufferedRanges,
    loadAudio,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
  }
}
