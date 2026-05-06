import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface DownloadButtonProps {
  audioBlob: Blob | null
  format: string
}

export function DownloadButton({ audioBlob, format }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!audioBlob) return

    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tts-output.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          disabled={!audioBlob}
          className="h-8 w-8 transition-all duration-200 hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>下载音频</TooltipContent>
    </Tooltip>
  )
}
