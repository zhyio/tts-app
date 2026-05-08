import { useEffect, useCallback } from "react"
import { Play, Pause, Loader2, Download, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { formatTime } from "@/lib/format-time"
import type { ChapterAudio } from "@/stores/use-chapter-store"
import type { ChapterStatus } from "@/stores/use-chapter-store"

interface ChapterCardProps {
  data: ChapterAudio
  onGenerate: () => void
  disabled?: boolean
}

export function ChapterCard({ data, onGenerate, disabled }: ChapterCardProps) {
  const { chapter, status, progress, error, audioUrl } = data
  const player = useAudioPlayer()

  useEffect(() => {
    if (audioUrl) {
      player.loadAudio(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  const handleDownload = useCallback(() => {
    if (!data.audioBlob) return
    const url = URL.createObjectURL(data.audioBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${chapter.title}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data.audioBlob, chapter.title])

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight truncate">{chapter.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {chapter.content.length} 字
          </p>
        </div>
        <ChapterStatusBadge status={status} progress={progress} />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {status === "waiting" && (
          <Button onClick={onGenerate} disabled={disabled} size="sm" className="transition-all duration-200">
            生成配音
          </Button>
        )}

        {status === "generating" && (
          <Button disabled size="sm" className="transition-all duration-200">
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            {progress > 0 ? `${Math.round(progress * 100)}%` : "生成中..."}
          </Button>
        )}

        {status === "done" && audioUrl && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={player.togglePlayPause}
              disabled={player.isLoading}
              className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-white/10"
            >
              {player.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : player.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            {/* Mini progress */}
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-100"
                  style={{
                    width: player.duration > 0
                      ? `${(player.currentTime / player.duration) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground w-16 text-right">
                {formatTime(player.currentTime)} / {formatTime(player.duration)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onGenerate}
              disabled={disabled}
              className="h-8 w-8 transition-all duration-200 hover:bg-white/10"
              title="重新生成"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8 transition-all duration-200 hover:bg-white/10"
              title={`下载 ${chapter.title}.wav`}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Button onClick={onGenerate} disabled={disabled} size="sm" variant="destructive" className="transition-all duration-200">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              重试
            </Button>
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[200px]">{error}</span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ChapterStatusBadge({ status, progress }: { status: ChapterStatus; progress: number }) {
  const label =
    status === "waiting" ? "等待中" :
    status === "generating" ? `${Math.round(progress * 100)}%` :
    status === "done" ? "已完成" :
    "失败"

  const color =
    status === "waiting" ? "bg-white/10 text-muted-foreground" :
    status === "generating" ? "bg-primary/20 text-primary" :
    status === "done" ? "bg-green-500/20 text-green-400" :
    "bg-destructive/20 text-destructive"

  return (
    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}
