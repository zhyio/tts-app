export type ModelType =
  | "mimo-v2.5-tts"
  | "mimo-v2.5-tts-voicedesign"
  | "mimo-v2.5-tts-voiceclone"

export type Voice =
  | "mimo_default"
  | "冰糖"
  | "茉莉"
  | "苏打"
  | "白桦"
  | "Mia"
  | "Chloe"
  | "Milo"
  | "Dean"

export interface TTSResponse {
  audioBlob: Blob
  audioUrl: string
  format: "wav"
}

export const MODEL_OPTIONS: { value: ModelType; label: string }[] = [
  { value: "mimo-v2.5-tts", label: "预置音色模式" },
  { value: "mimo-v2.5-tts-voicedesign", label: "音色设计模式" },
  { value: "mimo-v2.5-tts-voiceclone", label: "音色克隆模式" },
]

export const VOICE_ZH_OPTIONS: { value: Voice; label: string }[] = [
  { value: "mimo_default", label: "默认" },
  { value: "冰糖", label: "冰糖" },
  { value: "茉莉", label: "茉莉" },
  { value: "苏打", label: "苏打" },
  { value: "白桦", label: "白桦" },
  { value: "Mia", label: "Mia" },
  { value: "Chloe", label: "Chloe" },
  { value: "Milo", label: "Milo" },
  { value: "Dean", label: "Dean" },
]
