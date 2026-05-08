import { create } from "zustand"
import { useConfigStore } from "@/stores/use-config-store"
import { generateSpeech as apiGenerateSpeech } from "@/services/tts-api"
import { useAudioStore } from "@/stores/use-audio-store"
import type { Chapter } from "@/lib/md-parser"

export type ChapterStatus = "waiting" | "generating" | "done" | "error"

export interface ChapterAudio {
  chapter: Chapter
  status: ChapterStatus
  progress: number
  error: string | null
  audioBlob: Blob | null
  audioUrl: string | null
}

interface ChapterState {
  chapters: ChapterAudio[]
  mdFileName: string | null
  isGeneratingAll: boolean
  isGeneratingFull: boolean
  setChapters: (chapters: Chapter[], mdFileName?: string) => void
  generateChapter: (index: number) => Promise<void>
  generateAll: () => Promise<void>
  generateFullDocument: () => Promise<void>
  clearChapters: () => void
}

function buildChapterAudio(chapter: Chapter): ChapterAudio {
  return {
    chapter,
    status: "waiting",
    progress: 0,
    error: null,
    audioBlob: null,
    audioUrl: null,
  }
}

export const useChapterStore = create<ChapterState>()((set, get) => ({
  chapters: [],
  mdFileName: null,
  isGeneratingAll: false,
  isGeneratingFull: false,

  setChapters: (chapters, mdFileName?) => {
    set({ chapters: chapters.map(buildChapterAudio), isGeneratingAll: false, isGeneratingFull: false, mdFileName: mdFileName ?? null })
  },

  generateChapter: async (index: number) => {
    const { chapters } = get()
    const ca = chapters[index]
    if (!ca) return

    const { apiBaseUrl, modelName, apiKey } = useConfigStore.getState()
    if (!apiKey) {
      set({
        chapters: chapters.map((c, i) =>
          i === index
            ? { ...c, status: "error" as ChapterStatus, error: "请先在设置中配置 API Key" }
            : c
        ),
      })
      return
    }

    // Revoke previous URL if exists
    if (ca.audioUrl) URL.revokeObjectURL(ca.audioUrl)

    set({
      chapters: chapters.map((c, i) =>
        i === index
          ? { ...c, status: "generating" as ChapterStatus, progress: 0, error: null, audioBlob: null, audioUrl: null }
          : c
      ),
    })

    try {
      const result = await apiGenerateSpeech(
        {
          config: { apiBaseUrl, apiKey, modelName },
          mainText: ca.chapter.content,
          directorText: useConfigStore.getState().directorModeText || undefined,
        },
        (progress) => {
          set({
            chapters: get().chapters.map((c, i) =>
              i === index ? { ...c, progress } : c
            ),
          })
        }
      )

      set({
        chapters: get().chapters.map((c, i) =>
          i === index
            ? { ...c, status: "done" as ChapterStatus, progress: 1, audioBlob: result.audioBlob, audioUrl: result.audioUrl }
            : c
        ),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成失败"
      set({
        chapters: get().chapters.map((c, i) =>
          i === index
            ? { ...c, status: "error" as ChapterStatus, progress: 0, error: message }
            : c
        ),
      })
    }
  },

  generateAll: async () => {
    set({ isGeneratingAll: true })
    const { chapters } = get()
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].status === "done") continue
      await get().generateChapter(i)
    }
    set({ isGeneratingAll: false })
  },

  generateFullDocument: async () => {
    const { chapters, mdFileName } = get()
    if (chapters.length === 0) return

    const { apiBaseUrl, modelName, apiKey } = useConfigStore.getState()
    if (!apiKey) return

    set({ isGeneratingFull: true })

    const fullText = chapters.map((ca) => `${ca.chapter.rawTitle}\n${ca.chapter.content}`).join("\n\n")

    try {
      const result = await apiGenerateSpeech(
        {
          config: { apiBaseUrl, apiKey, modelName },
          mainText: fullText,
          directorText: useConfigStore.getState().directorModeText || undefined,
        },
        () => {}
      )

      useAudioStore.getState().clearAudio()
      useAudioStore.setState({
        audioBlob: result.audioBlob,
        audioUrl: result.audioUrl,
        audioFileName: mdFileName,
        sourceText: fullText,
        isGenerating: false,
      })
    } catch {
      // error handled silently
    }

    set({ isGeneratingFull: false })
  },

  clearChapters: () => {
    const { chapters } = get()
    for (const ca of chapters) {
      if (ca.audioUrl) URL.revokeObjectURL(ca.audioUrl)
    }
    set({ chapters: [], mdFileName: null, isGeneratingAll: false, isGeneratingFull: false })
  },
}))
