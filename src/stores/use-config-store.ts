import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Voice, ResponseFormat } from "@/types/api"

export type Emotion = "neutral" | "happy" | "sad" | "angry" | "fearful" | "disgusted" | "surprised"

export interface ConfigState {
  apiBaseUrl: string
  apiKey: string
  modelName: string
  voice: Voice
  responseFormat: ResponseFormat
  speed: number
  pitch: number
  emotion: Emotion
  setApiBaseUrl: (url: string) => void
  setApiKey: (key: string) => void
  setModelName: (name: string) => void
  setVoice: (voice: Voice) => void
  setResponseFormat: (format: ResponseFormat) => void
  setSpeed: (speed: number) => void
  setPitch: (pitch: number) => void
  setEmotion: (emotion: Emotion) => void
}

const DEFAULTS: Omit<ConfigState, "setApiBaseUrl" | "setApiKey" | "setModelName" | "setVoice" | "setResponseFormat" | "setSpeed" | "setPitch" | "setEmotion"> = {
  apiBaseUrl: "https://api.xiaomimimo.com/v1",
  apiKey: "",
  modelName: "MiMo-V2.5-TTS",
  voice: "mimo_default",
  responseFormat: "mp3",
  speed: 1.0,
  pitch: 0,
  emotion: "neutral",
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setApiKey: (key) => set({ apiKey: key }),
      setModelName: (name) => set({ modelName: name }),
      setVoice: (voice) => set({ voice }),
      setResponseFormat: (format) => set({ responseFormat: format }),
      setSpeed: (speed) => set({ speed }),
      setPitch: (pitch) => set({ pitch }),
      setEmotion: (emotion) => set({ emotion }),
    }),
    {
      name: "tts-app-config",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
