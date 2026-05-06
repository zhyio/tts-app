import { create } from "zustand"
import type { ResponseFormat, Voice } from "@/types/api"
import { generateSpeech } from "@/services/tts-api"
import { generateEstimatedSubtitles } from "@/services/subtitle-service"
import type { SubtitleSegment } from "@/services/subtitle-service"
import { useConfigStore } from "./use-config-store"

export interface AudioState {
  audioBlob: Blob | null
  audioUrl: string | null
  audioFormat: ResponseFormat
  sourceText: string
  subtitleSegments: SubtitleSegment[]
  isGenerating: boolean
  generationProgress: number
  generationError: string | null
  generateSpeech: (text: string, voice: Voice, format: ResponseFormat, speed: number, pitch?: number, emotion?: string) => Promise<void>
  clearAudio: () => void
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  audioBlob: null,
  audioUrl: null,
  audioFormat: "mp3",
  sourceText: "",
  subtitleSegments: [],
  isGenerating: false,
  generationProgress: 0,
  generationError: null,

  generateSpeech: async (text, voice, format, speed, pitch, emotion) => {
    const { apiBaseUrl, modelName, apiKey } = useConfigStore.getState()

    if (!apiKey) {
      set({ generationError: "请先在设置中配置 API Key" })
      return
    }

    // Clean up previous audio URL
    const prevUrl = get().audioUrl
    if (prevUrl) URL.revokeObjectURL(prevUrl)

    set({
      isGenerating: true,
      generationProgress: 0,
      generationError: null,
      audioBlob: null,
      audioUrl: null,
      sourceText: text,
    })

    try {
      const body = {
        model: modelName,
        input: text,
        voice,
        response_format: format,
        speed,
      };
      if (pitch !== undefined) (body as any).pitch = pitch;
      if (emotion !== undefined) (body as any).emotion = emotion;

      const result = await generateSpeech(
        { apiBaseUrl, apiKey, modelName },
        body,
        (progress) => set({ generationProgress: progress })
      )

      // Estimate subtitle segments (we need duration from the audio element later,
      // but for now we generate segments that will be rescaled when duration is known)
      const segments = generateEstimatedSubtitles(text, 0)

      set({
        audioBlob: result.audioBlob,
        audioUrl: result.audioUrl,
        audioFormat: result.format,
        subtitleSegments: segments,
        isGenerating: false,
        generationProgress: 1,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成语音失败"
      set({
        generationError: message,
        isGenerating: false,
        generationProgress: 0,
      })
    }
  },

  clearAudio: () => {
    const url = get().audioUrl
    if (url) URL.revokeObjectURL(url)
    set({
      audioBlob: null,
      audioUrl: null,
      audioFormat: "mp3",
      sourceText: "",
      subtitleSegments: [],
      isGenerating: false,
      generationProgress: 0,
      generationError: null,
    })
  },
}))
