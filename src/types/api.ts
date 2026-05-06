export type Voice =
  | "mimo_default"
  | "冰糖"
  | "茉莉"
  | "苏打"
  | "白桦"
  | "Mia"
  | "Chloe"
  | "Milo"

export type Emotion = "neutral" | "happy" | "sad" | "angry" | "fearful" | "disgusted" | "surprised"

export type ResponseFormat = "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm"

export interface TTSRequest {
  model: string
  input: string
  voice: Voice
  response_format?: ResponseFormat
  speed?: number
  pitch?: number
  emotion?: string
}

export interface TTSResponse {
  audioBlob: Blob
  audioUrl: string
  format: ResponseFormat
}

export const VOICE_OPTIONS: { value: Voice; label: string }[] = [
  { value: "mimo_default", label: "MiMo Default" },
  { value: "冰糖", label: "Bingtang" },
  { value: "茉莉", label: "Moli" },
  { value: "苏打", label: "Suda" },
  { value: "白桦", label: "Baihua" },
  { value: "Mia", label: "Mia" },
  { value: "Chloe", label: "Chloe" },
  { value: "Milo", label: "Milo" },
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
]

export const FORMAT_OPTIONS: { value: ResponseFormat; label: string }[] = [
  { value: "mp3", label: "MP3" },
  { value: "opus", label: "Opus" },
  { value: "aac", label: "AAC" },
  { value: "flac", label: "FLAC" },
  { value: "wav", label: "WAV" },
]

export const MIME_MAP: Record<ResponseFormat, string> = {
  mp3: "audio/mpeg",
  opus: "audio/opus",
  aac: "audio/aac",
  flac: "audio/flac",
  wav: "audio/wav",
  pcm: "audio/pcm",
}
