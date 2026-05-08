import { useState } from "react"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { TTSInput } from "@/components/tts/tts-input"
import { AudioPlayer } from "@/components/player/audio-player"
import { MdUpload } from "@/components/upload/md-upload"
import { ChapterList } from "@/components/chapter/chapter-list"
import { useAudioStore } from "@/stores/use-audio-store"
import { useChapterStore } from "@/stores/use-chapter-store"
import { WaveAnimation } from "@/components/ui/wave-animation"
import type { Chapter } from "@/lib/md-parser"
import { Button } from "@/components/ui/button"

export function HomePage() {
  const [docMode, setDocMode] = useState(false)
  const audioUrl = useAudioStore((s) => s.audioUrl)
  const isGenerating = useAudioStore((s) => s.isGenerating)
  const setChapters = useChapterStore((s) => s.setChapters)

  const handleParsed = (chapters: Chapter[], fileName?: string) => {
    setChapters(chapters, fileName)
  }

  return (
    <main className="container mx-auto max-w-7xl px-6 py-8">
      {/* Mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end mb-4"
      >
        <Button
          variant={docMode ? "default" : "ghost"}
          size="sm"
          onClick={() => setDocMode(!docMode)}
          className="transition-all duration-200"
        >
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          文档模式
        </Button>
      </motion.div>

      {docMode ? (
        /* ── Document Mode ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="glass-card p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                文档配音
              </h2>
              <p className="text-sm text-muted-foreground">
                上传 Markdown 文档，按章节自动生成配音。文档需包含「# 第X章」格式的章节标题。
              </p>
            </div>
            <MdUpload onParsed={handleParsed} />
          </div>

          <ChapterList onDocModeExit={() => setDocMode(false)} />
        </motion.div>
      ) : (
        /* ── Text Mode (original) ── */
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="glass-card p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  文本转语音
                </h2>
                <p className="text-sm text-muted-foreground">
                  支持预置音色、音色设计、音色克隆三种模式，输入文本，一键生成自然流畅的语音
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-7"
            >
              <div className="glass-card p-6">
                <TTSInput />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-5"
            >
              {audioUrl && !isGenerating && (
                <div className="glass-card p-6">
                  <AudioPlayer />
                </div>
              )}
            </motion.div>
          </div>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <WaveAnimation className="h-8" barCount={5} />
                  <span className="text-sm text-muted-foreground">正在生成语音...</span>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </main>
  )
}
