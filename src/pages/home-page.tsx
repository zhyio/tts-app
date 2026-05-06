import { motion } from "framer-motion"
import { TTSInput } from "@/components/tts/tts-input"
import { AudioPlayer } from "@/components/player/audio-player"
import { useAudioStore } from "@/stores/use-audio-store"
import { WaveAnimation } from "@/components/ui/wave-animation"

export function HomePage() {
  const audioUrl = useAudioStore((s) => s.audioUrl)
  const isGenerating = useAudioStore((s) => s.isGenerating)

  return (
    <main className="container mx-auto max-w-7xl px-6 py-8">
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
              输入文本，选择音色，一键生成自然流畅的语音
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
    </main>
  )
}
