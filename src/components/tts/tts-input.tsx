import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useConfigStore } from "@/stores/use-config-store"
import { useAudioStore } from "@/stores/use-audio-store"
import { VOICE_ZH_OPTIONS, FORMAT_OPTIONS } from "@/types/api"
import type { Voice, ResponseFormat, Emotion } from "@/types/api"
import { EMOTION_OPTIONS } from "@/components/config/config-drawer"

const MAX_CHARS = 2000

export function TTSInput() {
  const config = useConfigStore()
  const apiKey = config.apiKey
  const { isGenerating, generationProgress, generationError } = useAudioStore()
  const generateSpeech = useAudioStore((s) => s.generateSpeech)

  const [text, setText] = useState("")
  const [voice, setVoice] = useState<Voice>(config.voice)
  const [format, setFormat] = useState<ResponseFormat>(config.responseFormat)
  const [speed, setSpeed] = useState(config.speed)
  const [pitch, setPitch] = useState(config.pitch)
  const [emotion, setEmotion] = useState<Emotion>(config.emotion)

  const hasNoKey = !apiKey
  const isEmpty = text.trim().length === 0
  const isOverLimit = text.length > MAX_CHARS

  const handleGenerate = () => {
    if (isEmpty || isOverLimit || isGenerating) return
    generateSpeech(text, voice, format, speed, pitch, emotion)
  }

  return (
    <div className="space-y-5">
      {/* Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">输入文本</Label>
          <span
            className={`text-xs tabular-nums ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {text.length}/{MAX_CHARS}
          </span>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要转换为语音的文本..."
          className="min-h-[160px] resize-none text-base leading-relaxed transition-all duration-200"
        />
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Voice */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">音色</Label>
          <Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
            <SelectTrigger className="w-[120px] transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_ZH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">格式</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as ResponseFormat)}>
            <SelectTrigger className="w-[100px] transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            语速 <span className="tabular-nums">{speed.toFixed(1)}x</span>
          </Label>
          <Slider
            value={[speed]}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] ?? speed : value
              setSpeed(v)
            }}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-[140px]"
          />
        </div>

        {/* Pitch */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            音调 <span className="tabular-nums">{pitch}</span>
          </Label>
          <Slider
            value={[pitch]}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] ?? pitch : value
              setPitch(v)
            }}
            min={-12}
            max={12}
            step={1}
            className="w-[140px]"
          />
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={isEmpty || isOverLimit || isGenerating || hasNoKey}
          className="ml-auto transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {generationProgress > 0
                ? `${Math.round(generationProgress * 100)}%`
                : "生成中..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              生成语音
            </>
          )}
        </Button>
      </div>

      {/* Emotion */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">情感倾向</Label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_OPTIONS.map((opt: typeof EMOTION_OPTIONS[0]) => (
            <Button
              key={opt.value}
              variant={emotion === opt.value ? "default" : "outline"}
              size="sm"
              className="transition-all duration-200"
              onClick={() => setEmotion(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error */}
      {generationError && (
        <p className="text-sm text-destructive">{generationError}</p>
      )}

      {/* No API key warning */}
      {hasNoKey && !isGenerating && (
        <p className="text-xs text-muted-foreground">
          请先点击右上角设置图标配置 API Key
        </p>
      )}
    </div>
  )
}
