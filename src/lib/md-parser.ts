export interface Chapter {
  index: number
  title: string
  rawTitle: string
  content: string
}

const CHAPTER_RE = /^#\s*第([一二三四五六七八九十百千万\d]+)章[：:\s]*(.*)?$/gm

/**
 * Remove markdown formatting characters from text to make it TTS-friendly.
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/^---+$/gm, "") // horizontal rules
    .replace(/^[-*+]\s+/gm, "") // list bullets
    .replace(/^\d+\.\s+/gm, "") // numbered lists
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline code / code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // images
    .replace(/>\s+/gm, "") // blockquotes
    .replace(/\n{3,}/g, "\n\n") // collapse blank lines
    .trim()
}

export function parseChapters(text: string): Chapter[] {
  const chapters: Chapter[] = []

  // Collect all chapter boundary positions
  const boundaries: { index: number; match: RegExpExecArray }[] = []
  CHAPTER_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = CHAPTER_RE.exec(text)) !== null) {
    boundaries.push({ index: m.index, match: m })
  }

  if (boundaries.length === 0) return []

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].index
    const end = i + 1 < boundaries.length ? boundaries[i + 1].index : text.length
    const section = text.slice(start, end)

    const match = boundaries[i].match
    const chapterNum = match[1]
    const subtitle = (match[2] || "").trim()

    // Build title: prefer "第X章：副标题" format, fall back to "第X章"
    const title = subtitle ? `第${chapterNum}章：${subtitle}` : `第${chapterNum}章`

    // Extract content: remove all heading lines from the section
    const lines = section.split("\n")
    const contentLines: string[] = []
    let pastHeading = false
    for (const line of lines) {
      if (!pastHeading) {
        if (/^#\s*第[一二三四五六七八九十百千万\d]+章/.test(line)) {
          continue // skip heading lines
        }
        pastHeading = true
      }
      contentLines.push(line)
    }

    const rawContent = contentLines.join("\n").trim()
    const content = cleanMarkdown(rawContent)

    if (content.length === 0) continue

    chapters.push({
      index: i + 1,
      title,
      rawTitle: `第${chapterNum}章`,
      content,
    })
  }

  return chapters
}
