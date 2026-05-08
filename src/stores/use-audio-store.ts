import { create } from "zustand"
import { useConfigStore } from "@/stores/use-config-store"
import type { Voice } from "@/types/api"
import { generateSpeech as apiGenerateSpeech } from "@/services/tts-api"
import type { SubtitleSegment } from "@/services/subtitle-service"

export interface AudioState {
  audioBlob: Blob | null
  audioUrl: string | null
  audioFileName: string | null
  audioFormat: "wav"
  sourceText: string
  subtitleSegments: SubtitleSegment[]
  isGenerating: boolean
  generationProgress: number
  generationError: string | null
  generateSpeech: (params: {
    mainText: string
    emotionTags?: string[]
    actionTags?: string[]
    directorText?: string
    presetVoice?: Voice
    voiceDesignPrompt?: string
    cloneBase64?: string
  }) => Promise<void>
  clearAudio: () => void
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  audioBlob: null,
  audioUrl: null,
  audioFileName: null,
  audioFormat: "wav",
  sourceText: "",
  subtitleSegments: [],
  isGenerating: false,
  generationProgress: 0,
  generationError: null,

  generateSpeech: async (params) => {
    const { apiBaseUrl, modelName, apiKey } = useConfigStore.getState()

    if (!apiKey) {
      set({ generationError: "请先在设置中配置 API Key" })
      return
    }

    const prevUrl = get().audioUrl
    if (prevUrl) URL.revokeObjectURL(prevUrl)

    set({
      isGenerating: true,
      generationProgress: 0,
      generationError: null,
      audioBlob: null,
      audioUrl: null,
      sourceText: params.mainText,
      audioFileName: null,
    })

    try {
      const result = await apiGenerateSpeech(
        {
          config: { apiBaseUrl, apiKey, modelName },
          mainText: params.mainText,
          emotionTags: params.emotionTags,
          actionTags: params.actionTags,
          directorText: params.directorText,
          presetVoice: params.presetVoice,
          voiceDesignPrompt: params.voiceDesignPrompt,
          cloneBase64: params.cloneBase64,
        },
        (progress) => set({ generationProgress: progress })
      )

      // Simple subtitle segments based on punctuation
      const text = params.mainText
      const segments: SubtitleSegment[] = []
      const sentences = text.split(/([。！？\n]+)/)
      let currentTime = 0
      for (const sentence of sentences) {
        if (!sentence.trim()) continue
        const duration = sentence.length * 0.1
        segments.push({
          text: sentence,
          startTime: currentTime,
          endTime: currentTime + duration,
        })
        currentTime += duration
      }

      set({
        audioBlob: result.audioBlob,
        audioUrl: result.audioUrl,
        audioFormat: "wav",
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
      audioFormat: "wav",
      sourceText: "",
      subtitleSegments: [],
      isGenerating: false,
      generationProgress: 0,
      generationError: null,
      audioFileName: null,
    })
  },
}))
