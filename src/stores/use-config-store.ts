import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Voice, ModelType } from "@/types/api"

export interface ConfigState {
  apiBaseUrl: string
  apiKey: string
  modelName: ModelType
  voice: Voice
  directorModeText: string
  setApiBaseUrl: (url: string) => void
  setApiKey: (key: string) => void
  setModelName: (name: ModelType) => void
  setVoice: (voice: Voice) => void
  setDirectorModeText: (text: string) => void
}

const DEFAULTS: Omit<
  ConfigState,
  | "setApiBaseUrl"
  | "setApiKey"
  | "setModelName"
  | "setVoice"
  | "setDirectorModeText"
> = {
  apiBaseUrl: "https://api.xiaomimimo.com/v1",
  apiKey: "",
  modelName: "mimo-v2.5-tts",
  voice: "mimo_default",
  directorModeText: "",
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setApiKey: (key) => set({ apiKey: key }),
      setModelName: (name) => set({ modelName: name }),
      setVoice: (voice) => set({ voice }),
      setDirectorModeText: (text) => set({ directorModeText: text }),
    }),
    {
      name: "tts-app-config",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
