import { Play, Pause, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface PlayPauseButtonProps {
  isPlaying: boolean
  isLoading: boolean
  onToggle: () => void
}

export function PlayPauseButton({
  isPlaying,
  isLoading,
  onToggle,
}: PlayPauseButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          disabled={isLoading}
          className="h-10 w-10 rounded-full transition-all duration-200 hover:bg-white/10"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isPlaying ? "暂停" : "播放"}
      </TooltipContent>
    </Tooltip>
  )
}
