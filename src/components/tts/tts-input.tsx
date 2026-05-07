import { useState, useRef } from "react"
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
import { Input } from "@/components/ui/input"
import { useConfigStore } from "@/stores/use-config-store"
import { useAudioStore } from "@/stores/use-audio-store"
import { VOICE_ZH_OPTIONS, type Voice, type ModelType } from "@/types/api"
import { FileUpload } from "@/components/tts/file-upload"

const MAX_CHARS = 2000

const EMOTION_TAGS = [
  { tag: "(开心)", label: "开心" },
  { tag: "(怅然)", label: "怅然" },
  { tag: "(慵懒)", label: "慵懒" },
  { tag: "(东北话)", label: "东北话" },
]

const ACTION_TAGS = [
  { tag: "[深呼吸]", label: "深呼吸" },
  { tag: "[叹气]", label: "叹气" },
  { tag: "[笑]", label: "笑" },
  { tag: "[哽咽]", label: "哽咽" },
  { tag: "[咳嗽]", label: "咳嗽" },
]

function insertTag(text: string, tag: string, textareaRef: React.RefObject<HTMLTextAreaElement | null>): string {
  const el = textareaRef.current
  if (!el) return text + tag
  const start = el.selectionStart
  const end = el.selectionEnd
  return text.slice(0, start) + tag + text.slice(end)
}

export function TTSInput() {
  const config = useConfigStore()
  const modelName = config.modelName as ModelType
  const apiKey = config.apiKey
  const { isGenerating, generationProgress, generationError } = useAudioStore()
  const generateSpeech = useAudioStore((s) => s.generateSpeech)

  const [text, setText] = useState("")
  const [voice, setVoice] = useState<Voice>(config.voice)
  const [emotionTags, setEmotionTags] = useState<string[]>([])
  const [actionTags, setActionTags] = useState<string[]>([])
  const [directorText, setDirectorText] = useState(config.directorModeText)
  const [voiceDesignPrompt, setVoiceDesignPrompt] = useState("")
  const [cloneBase64, setCloneBase64] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const hasNoKey = !apiKey
  const isEmpty = text.trim().length === 0
  const isOverLimit = text.length > MAX_CHARS

  const handleInsertTag = (tag: string) => {
    const newText = insertTag(text, tag, textareaRef)
    setText(newText)
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = textareaRef.current.selectionStart
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  const toggleEmotionTag = (tag: string) => {
    if (emotionTags.includes(tag)) {
      setEmotionTags(emotionTags.filter((t) => t !== tag))
    } else {
      setEmotionTags([...emotionTags, tag])
    }
  }

  const toggleActionTag = (tag: string) => {
    if (actionTags.includes(tag)) {
      setActionTags(actionTags.filter((t) => t !== tag))
    } else {
      setActionTags([...actionTags, tag])
    }
  }

  const handleGenerate = () => {
    if (isEmpty || isOverLimit || isGenerating) return

    const params: Parameters<typeof generateSpeech>[0] = {
      mainText: text,
      emotionTags: emotionTags.length > 0 ? emotionTags : undefined,
      actionTags: actionTags.length > 0 ? actionTags : undefined,
      directorText: directorText || undefined,
    }

    if (modelName === "mimo-v2.5-tts") {
      params.presetVoice = voice
    } else if (modelName === "mimo-v2.5-tts-voicedesign") {
      params.voiceDesignPrompt = voiceDesignPrompt
    } else if (modelName === "mimo-v2.5-tts-voiceclone") {
      params.cloneBase64 = cloneBase64
    }

    generateSpeech(params)
  }

  return (
    <div className="space-y-5">
      {/* Director Mode Input - Global for all models */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          自然语言指导 / 场景设定（可选）
        </Label>
        <Input
          value={directorText}
          onChange={(e) => setDirectorText(e.target.value)}
          placeholder="例如：用温柔的语气朗读，像在讲故事一样"
          className="text-sm transition-all duration-200"
        />
      </div>

      {/* Quick Insert Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-1 self-center">快速插入：</span>
        {EMOTION_TAGS.map(({ tag, label }) => (
          <Button
            key={tag}
            variant={emotionTags.includes(tag) ? "default" : "outline"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => toggleEmotionTag(tag)}
          >
            {label}
          </Button>
        ))}
        <span className="w-px h-4 bg-white/10 self-center mx-1" />
        {ACTION_TAGS.map(({ tag, label }) => (
          <Button
            key={tag}
            variant={actionTags.includes(tag) ? "default" : "outline"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => toggleActionTag(tag)}
          >
            {label}
          </Button>
        ))}
        {modelName === "mimo-v2.5-tts" && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleInsertTag("(唱歌)")}
          >
            (唱歌)
          </Button>
        )}
      </div>

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
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要转换为语音的文本..."
          className="min-h-[160px] resize-none text-base leading-relaxed transition-all duration-200"
        />
      </div>

      {/* Model-specific controls */}
      {modelName === "mimo-v2.5-tts" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">预设音色</Label>
          <Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
            <SelectTrigger className="w-[140px] transition-all duration-200">
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
      )}

      {modelName === "mimo-v2.5-tts-voicedesign" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">音色设计描述</Label>
          <Textarea
            value={voiceDesignPrompt}
            onChange={(e) => setVoiceDesignPrompt(e.target.value)}
            placeholder="young woman in her mid-20s, warm and confident"
            className="min-h-[80px] text-sm"
          />
        </div>
      )}

      {modelName === "mimo-v2.5-tts-voiceclone" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">上传音频样本</Label>
          <FileUpload
            onFileReady={(base64) => setCloneBase64(base64)}
            onFileRemove={() => setCloneBase64("")}
            disabled={isGenerating}
          />
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isEmpty || isOverLimit || isGenerating || hasNoKey}
        className="w-full transition-all duration-200"
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
