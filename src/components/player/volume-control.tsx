import { Volume2, Volume1, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface VolumeControlProps {
  volume: number
  onVolumeChange: (vol: number) => void
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  const handleToggleMute = () => {
    onVolumeChange(volume === 0 ? 1 : 0)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleMute}
        className="h-8 w-8 transition-all duration-200 hover:bg-white/10"
      >
        <VolumeIcon className="h-4 w-4" />
      </Button>
      <Slider
        value={[volume]}
        onValueChange={(value) => {
          const v = Array.isArray(value) ? value[0] ?? volume : value
          onVolumeChange(v)
        }}
        min={0}
        max={1}
        step={0.01}
        className="w-20"
      />
    </div>
  )
}
