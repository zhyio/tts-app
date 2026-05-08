import { useEffect } from "react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { useAudioStore } from "@/stores/use-audio-store"
import { rescaleSubtitles } from "@/services/subtitle-service"
import { PlayPauseButton } from "./play-pause-button"
import { ProgressBar } from "./progress-bar"
import { DownloadButton } from "./download-button"
import { VolumeControl } from "./volume-control"
import { SubtitleDisplay } from "./subtitle-display"

export function AudioPlayer() {
  const {
    audioUrl,
    audioBlob,
    audioFileName,
    audioFormat,
    subtitleSegments,
  } = useAudioStore()

  const player = useAudioPlayer()

  // Load audio when URL changes
  useEffect(() => {
    if (audioUrl) {
      player.loadAudio(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  // Rescale subtitles when duration becomes available
  useEffect(() => {
    if (player.duration > 0 && subtitleSegments.length > 0) {
      const needsRescale = subtitleSegments.some((s) => s.endTime === 0)
      if (needsRescale) {
        const rescaled = rescaleSubtitles(subtitleSegments, player.duration)
        useAudioStore.setState({ subtitleSegments: rescaled })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.duration, subtitleSegments])

  if (!audioUrl) return null

  return (
    <div className="space-y-5">
      {/* Subtitle */}
      <SubtitleDisplay
        segments={subtitleSegments}
        currentTime={player.currentTime}
        duration={player.duration}
      />

      {/* Player controls */}
      <div className="glass-card px-6 py-5">
        {/* Progress bar */}
        <div className="mb-4">
          <ProgressBar
            currentTime={player.currentTime}
            duration={player.duration}
            bufferedRanges={player.bufferedRanges}
            onSeek={player.seek}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <PlayPauseButton
            isPlaying={player.isPlaying}
            isLoading={player.isLoading}
            onToggle={player.togglePlayPause}
          />

          <div className="flex items-center gap-2">
            <VolumeControl
              volume={player.volume}
              onVolumeChange={player.setVolume}
            />
            <DownloadButton audioBlob={audioBlob} format={audioFormat} fileName={audioFileName} />
          </div>
        </div>
      </div>
    </div>
  )
}
