import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { parseChapters } from "@/lib/md-parser"

interface MdUploadProps {
  onParsed: (chapters: ReturnType<typeof parseChapters>, fileName: string) => void
}

export function MdUpload({ onParsed }: MdUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".md")) {
        setError("仅支持 .md 格式的 Markdown 文件")
        return
      }

      setError(null)
      setFileName(file.name)

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const chapters = parseChapters(text)
        if (chapters.length === 0) {
          setError("未找到章节标记（需要包含「# 第X章」格式的标题）")
          return
        }
        onParsed(chapters, file.name.replace(/\.md$/i, ""))
      }
      reader.onerror = () => {
        setError("文件读取失败")
      }
      reader.readAsText(file, "utf-8")
    },
    [onParsed],
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
    if (file) processFile(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleRemove = () => {
    setFileName(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      {fileName ? (
        <div className="flex items-center gap-3 p-4 glass-subtle rounded-lg">
          <FileText className="h-6 w-6 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">已上传，解析完毕</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-7 w-7 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-white/10 hover:border-white/20"
            }
          `}
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            拖拽 Markdown 文件到此处，或点击上传
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            支持 .md 文件，需包含「# 第X章」格式的章节标题
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".md,text/markdown"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
