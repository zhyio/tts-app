import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConfigStore } from "@/stores/use-config-store"
import type { ModelType } from "@/types/api"
import { MODEL_OPTIONS } from "@/types/api"
import { VOICE_ZH_OPTIONS, type Voice } from "@/types/api"

interface ConfigDrawerProps {
  open: boolean
  onClose: () => void
}

export function ConfigDrawer({ open, onClose }: ConfigDrawerProps) {
  const config = useConfigStore()

  const [apiBaseUrl, setApiBaseUrl] = useState(config.apiBaseUrl)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [modelName, setModelName] = useState<ModelType>(config.modelName)
  const [voice, setVoice] = useState(config.voice)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (open) {
      setApiBaseUrl(config.apiBaseUrl)
      setApiKey(config.apiKey)
      setModelName(config.modelName)
      setVoice(config.voice)
    }
  }, [open, config])

  const handleSave = () => {
    config.setApiBaseUrl(apiBaseUrl)
    config.setApiKey(apiKey)
    config.setModelName(modelName)
    config.setVoice(voice)
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
              </div>

              <div className="h-px bg-white/5" />

              {/* Model Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">模型选择</h3>

                <div className="space-y-2">
                  <Label className="text-xs">TTS 模型</Label>
                  <Select value={modelName} onValueChange={(v) => setModelName(v as ModelType)}>
                    <SelectTrigger className="transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <div>{opt.label}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">默认音色</Label>
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
