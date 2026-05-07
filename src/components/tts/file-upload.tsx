import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, FileAudio } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileReady: (base64: string, file: File) => void
  onFileRemove: () => void
  disabled?: boolean
}

export function FileUpload({ onFileReady, onFileRemove, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ name: string; size: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndProcess = useCallback(
    async (file: File) => {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav"]
      const validExts = [".mp3", ".wav"]
      const ext = "." + file.name.split(".").pop()?.toLowerCase()

      if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
        setError("仅支持 .mp3 或 .wav 格式")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("文件大小不能超过 10MB")
        return
      }

      setError(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onFileReady(result, file)
        setPreview({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        })
      }
      reader.readAsDataURL(file)
    },
    [onFileReady],
  )

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndProcess(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndProcess(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onFileRemove()
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="flex items-center gap-3 p-3 glass-subtle rounded-lg">
          <FileAudio className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{preview.name}</p>
            <p className="text-xs text-muted-foreground">{preview.size}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? "border-primary bg-primary/5"
              : "border-white/10 hover:border-white/20"
            }
          `}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            拖拽音频文件到此处，或点击上传
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            支持 .mp3 / .wav，小于 10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
