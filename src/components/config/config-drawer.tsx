import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConfigStore } from "@/stores/use-config-store"
import type { Emotion, Voice, ResponseFormat } from "@/types/api"
import { VOICE_ZH_OPTIONS, FORMAT_OPTIONS } from "@/types/api"

export const EMOTION_OPTIONS: { value: Emotion; label: string }[] = [
  { value: "neutral", label: "中性" },
  { value: "happy", label: "开心" },
  { value: "sad", label: "悲伤" },
  { value: "angry", label: "愤怒" },
  { value: "fearful", label: "恐惧" },
  { value: "disgusted", label: "厌恶" },
  { value: "surprised", label: "惊讶" },
]

interface ConfigDrawerProps {
  open: boolean
  onClose: () => void
}

export function ConfigDrawer({ open, onClose }: ConfigDrawerProps) {
  const config = useConfigStore()

  const [apiBaseUrl, setApiBaseUrl] = useState(config.apiBaseUrl)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [modelName, setModelName] = useState(config.modelName)
  const [voice, setVoice] = useState<Voice>(config.voice)
  const [speed, setSpeed] = useState(config.speed)
  const [pitch, setPitch] = useState(config.pitch)
  const [emotion, setEmotion] = useState<Emotion>(config.emotion)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (open) {
      setApiBaseUrl(config.apiBaseUrl)
      setApiKey(config.apiKey)
      setModelName(config.modelName)
      setVoice(config.voice)
      setSpeed(config.speed)
      setPitch(config.pitch)
      setEmotion(config.emotion)
    }
  }, [open, config])

  const handleSave = () => {
    config.setApiBaseUrl(apiBaseUrl)
    config.setApiKey(apiKey)
    config.setModelName(modelName)
    config.setVoice(voice)
    config.setResponseFormat(config.responseFormat)
    config.setSpeed(speed)
    config.setPitch(pitch)
    config.setEmotion(emotion)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-80 overflow-y-auto glass border-l border-white/10 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">配置面板</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-5">
              {/* API Config */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">API 设置</h3>

                <div className="space-y-2">
                  <Label className="text-xs">API Base URL</Label>
                  <Input
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">API Key</Label>
                  <div className="relative">
                    <Input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10 transition-all duration-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">模型名称</Label>
                  <Input
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="transition-all duration-200"
                  />
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Voice & Format */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">语音参数</h3>

                <div className="space-y-2">
                  <Label className="text-xs">音色</Label>
                  <Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
                    <SelectTrigger className="transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_ZH_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">输出格式</Label>
                  <Select value={config.responseFormat} onValueChange={(v) => config.setResponseFormat(v as ResponseFormat)}>
                    <SelectTrigger className="w-[120px] transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Speed */}
              <div className="space-y-2">
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
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0.5x</span>
                  <span>2.0x</span>
                </div>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
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
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>-12</span>
                  <span>0</span>
                  <span>+12</span>
                </div>
              </div>

              {/* Emotion */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">情感倾向</Label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.map((opt) => (
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

              <div className="h-px bg-white/5" />

              {/* Save */}
              <Button onClick={handleSave} className="w-full transition-all duration-200">
                保存配置
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
