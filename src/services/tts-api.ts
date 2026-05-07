import type { ModelType, Voice } from "@/types/api"

export interface TTSGenerateParams {
  config: {
    apiBaseUrl: string
    apiKey: string
    modelName: ModelType
  }
  mainText: string
  emotionTags?: string[]
  actionTags?: string[]
  directorText?: string
  presetVoice?: Voice
  voiceDesignPrompt?: string
  cloneBase64?: string
}

export interface TTSResponse {
  audioBlob: Blob
  audioUrl: string
  format: "wav"
}

function buildMessages(params: TTSGenerateParams): [
  { role: "user"; content: string },
  { role: "assistant"; content: string }
] {
  let userContent = ""

  if (params.config.modelName === "mimo-v2.5-tts-voicedesign") {
    userContent = params.voiceDesignPrompt || ""
  } else {
    userContent = params.directorText || ""
  }

  let assistantContent = params.mainText

  if (params.emotionTags && params.emotionTags.length > 0) {
    assistantContent = params.emotionTags.join("") + assistantContent
  }

  if (params.actionTags && params.actionTags.length > 0) {
    assistantContent = assistantContent + params.actionTags.join("")
  }

  return [
    { role: "user", content: userContent },
    { role: "assistant", content: assistantContent },
  ]
}

function buildAudioConfig(
  params: TTSGenerateParams
): { voice: string; format: "wav" } | undefined {
  if (params.config.modelName === "mimo-v2.5-tts-voicedesign") {
    return undefined
  }

  let voiceValue = ""
  if (params.config.modelName === "mimo-v2.5-tts") {
    voiceValue = params.presetVoice || "mimo_default"
  } else if (params.config.modelName === "mimo-v2.5-tts-voiceclone") {
    voiceValue = params.cloneBase64 || ""
  }

  return { voice: voiceValue, format: "wav" }
}

export async function generateSpeech(
  params: TTSGenerateParams,
  onProgress?: (progress: number) => void,
): Promise<TTSResponse> {
  const baseUrl = params.config.apiBaseUrl.replace(/\/+$/, "")
  const url = `${baseUrl}/chat/completions`

  const inputLen = params.mainText.length
  const maxTokens = Math.min(Math.max(4000, Math.ceil(inputLen * 15)), 50000)

  const messages = buildMessages(params)
  const audioConfig = buildAudioConfig(params)

  const body: Record<string, unknown> = {
    model: params.config.modelName,
    modalities: ["text", "audio"],
    max_tokens: maxTokens,
    messages,
    stream: false,
  }

  if (audioConfig && audioConfig.voice) {
    body.audio = audioConfig
  }

  if (import.meta.env.DEV) {
    console.log("[TTS API] Request:", {
      url,
      model: body.model,
      voice: (body.audio as any)?.voice,
      directorText: messages[0].content,
      assistantPreview: messages[1].content.slice(0, 100),
    })
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `API 错误: ${response.status}`
    try {
      const errorBody = await response.json()
      if (errorBody.error?.message) {
        message = errorBody.error.message
      }
    } catch {
      // Non-JSON error response
    }
    throw new Error(message)
  }

  const data = await response.json()

  if (import.meta.env.DEV) {
    console.log("[TTS API] Response:", {
      id: data.id,
      model: data.model,
      usage: data.usage,
      hasAudio: !!data.choices?.[0]?.message?.audio?.data,
    })
  }

  const audioData = data.choices?.[0]?.message?.audio?.data
  if (!audioData) {
    const completionTokens = data.usage?.completion_tokens ?? 0
    throw new Error(
      `API 响应中未找到音频数据 (completion_tokens: ${completionTokens})。请检查输入文本长度或尝试更换音色。`
    )
  }

  const mimeType = "audio/wav"
  const binaryString = atob(audioData)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const audioBlob = new Blob([bytes], { type: mimeType })
  const audioUrl = URL.createObjectURL(audioBlob)

  onProgress?.(1)

  return { audioBlob, audioUrl, format: "wav" }
}
