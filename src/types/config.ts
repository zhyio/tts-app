import type { Voice, ResponseFormat } from "./api"

export interface ConfigState {
  apiBaseUrl: string
  modelName: string
  voice: Voice
  responseFormat: ResponseFormat
  speed: number
  setApiBaseUrl: (url: string) => void
  setModelName: (name: string) => void
  setVoice: (voice: Voice) => void
  setResponseFormat: (format: ResponseFormat) => void
  setSpeed: (speed: number) => void
}

export interface ApiKeyState {
  apiKey: string
  setApiKey: (key: string) => void
}
