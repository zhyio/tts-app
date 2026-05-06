import type { TTSRequest, TTSResponse } from "@/types/api"

interface TTSConfig {
  apiBaseUrl: string
  apiKey: string
  modelName: string
}

interface ChatCompletionResponse {
  choices: {
    message: {
      audio?: {
        data?: string // base64 encoded audio
        id?: string
      }
      content?: string
    }
  }[]
  usage?: {
    completion_tokens?: number
    prompt_tokens?: number
  }
}

export async function generateSpeech(
  config: TTSConfig,
  request: TTSRequest,
  onProgress?: (progress: number) => void,
): Promise<TTSResponse> {
  const baseUrl = config.apiBaseUrl.replace(/\/+$/, "")
  const url = `${baseUrl}/chat/completions`

  const inputLen = request.input.length
  const maxTokens = Math.min(Math.max(4000, Math.ceil(inputLen * 15)), 50000)

  const body = {
    model: config.modelName,
    modalities: ["text", "audio"],
    audio: {
      voice: request.voice || "mimo_default",
      format: request.response_format || "mp3",
    },
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: "请朗读以下文字",
      },
      {
        role: "assistant",
        content: request.input,
      },
    ],
  }

  if (import.meta.env.DEV) {
    console.log("[TTS API] Request:", {
      url,
      model: body.model,
      voice: body.audio.voice,
      format: body.audio.format,
      max_tokens: body.max_tokens,
      inputLength: inputLen,
    })
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
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

  const data: ChatCompletionResponse = await response.json()

  if (import.meta.env.DEV) {
    console.log("[TTS API] Response:", {
      id: data.id,
      model: data.model,
      usage: data.usage,
      hasAudio: !!data.choices?.[0]?.message?.audio?.data,
      audioId: data.choices?.[0]?.message?.audio?.id,
    })
  }

  // Extract base64 audio from response
  const audioData = data.choices?.[0]?.message?.audio?.data
  if (!audioData) {
    const completionTokens = data.usage?.completion_tokens ?? 0
    throw new Error(
      `API 响应中未找到音频数据 (completion_tokens: ${completionTokens})。请检查输入文本长度或尝试更换音色。`
    )
  }

  // Check if audio data seems too short
  if (audioData.length < 1000 && inputLen > 100) {
    console.warn(
      `[TTS API] Warning: audio data seems short (${audioData.length} chars base64) for input text (${inputLen} chars)`
    )
  }

  // Convert base64 to Blob
  const format = request.response_format || "mp3"
  const mimeType = getMimeType(format)
  const binaryString = atob(audioData)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const audioBlob = new Blob([bytes], { type: mimeType })
  const audioUrl = URL.createObjectURL(audioBlob)

  onProgress?.(1)

  return { audioBlob, audioUrl, format }
}

function getMimeType(format: string): string {
  const map: Record<string, string> = {
    mp3: "audio/mpeg",
    opus: "audio/opus",
    aac: "audio/aac",
    flac: "audio/flac",
    wav: "audio/wav",
  }
  return map[format] || "audio/mpeg"
}
