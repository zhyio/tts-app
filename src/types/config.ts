import type { Voice } from "./api"

export interface ConfigState {
  apiBaseUrl: string
  modelName: string
  voice: Voice
  setApiBaseUrl: (url: string) => void
  setModelName: (name: string) => void
  setVoice: (voice: Voice) => void
}

export interface ApiKeyState {
  apiKey: string
  setApiKey: (key: string) => void
}
