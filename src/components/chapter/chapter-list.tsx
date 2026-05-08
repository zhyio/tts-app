import { Sparkles, FileAudio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChapterCard } from "@/components/chapter/chapter-card"
import { useChapterStore } from "@/stores/use-chapter-store"

interface ChapterListProps {
  onDocModeExit: () => void
}

export function ChapterList({ onDocModeExit }: ChapterListProps) {
  const chapters = useChapterStore((s) => s.chapters)
  const isGeneratingAll = useChapterStore((s) => s.isGeneratingAll)
  const isGeneratingFull = useChapterStore((s) => s.isGeneratingFull)
  const generateChapter = useChapterStore((s) => s.generateChapter)
  const generateAll = useChapterStore((s) => s.generateAll)
  const generateFullDocument = useChapterStore((s) => s.generateFullDocument)
  const clearChapters = useChapterStore((s) => s.clearChapters)

  if (chapters.length === 0) return null

  const doneCount = chapters.filter((c) => c.status === "done").length
  const hasWaiting = chapters.some((c) => c.status === "waiting" || c.status === "error")

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            章节列表
          </h2>
          <span className="text-xs text-muted-foreground">
            {doneCount}/{chapters.length} 已完成
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasWaiting && (
            <Button
              onClick={generateAll}
              disabled={isGeneratingAll || isGeneratingFull}
              size="sm"
              className="transition-all duration-200"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {isGeneratingAll ? "生成中..." : "全部生成"}
            </Button>
          )}
          <Button
            onClick={generateFullDocument}
            disabled={isGeneratingFull || isGeneratingAll}
            size="sm"
            variant={isGeneratingFull ? "default" : "outline"}
            className="transition-all duration-200"
          >
            <FileAudio className="mr-1.5 h-3.5 w-3.5" />
            {isGeneratingFull ? "整本生成中..." : "生成整本"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearChapters()
              onDocModeExit()
            }}
            className="text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            退出文档模式
          </Button>
        </div>
      </div>

      {/* Chapter cards */}
      <div className="space-y-3">
        {chapters.map((ca, i) => (
          <ChapterCard
            key={`${ca.chapter.index}-${i}`}
            data={ca}
            onGenerate={() => generateChapter(i)}
            disabled={isGeneratingAll || isGeneratingFull}
          />
        ))}
      </div>
    </div>
  )
}
