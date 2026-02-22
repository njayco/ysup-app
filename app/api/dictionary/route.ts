import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface DictionaryMeaning {
  partOfSpeech: string
  definitions: {
    definition: string
    example?: string
    synonyms: string[]
    antonyms: string[]
  }[]
  synonyms: string[]
  antonyms: string[]
}

interface DictionaryEntry {
  word: string
  phonetic?: string
  phonetics: {
    text?: string
    audio?: string
  }[]
  meanings: DictionaryMeaning[]
  origin?: string
  sourceUrls?: string[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const words = query.trim().split(/\s+/).slice(0, 3)

    const results = await Promise.allSettled(
      words.map(async (word) => {
        const res = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (!res.ok) return null
        const data: DictionaryEntry[] = await res.json()
        if (!data || !Array.isArray(data) || data.length === 0) return null

        const entry = data[0]
        const phonetic = entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || ""
        const audioUrl = entry.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio || ""

        const meanings = entry.meanings.map((m) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions.slice(0, 3).map((d) => ({
            definition: d.definition,
            example: d.example || "",
            synonyms: d.synonyms?.slice(0, 5) || [],
            antonyms: d.antonyms?.slice(0, 5) || [],
          })),
          synonyms: m.synonyms?.slice(0, 8) || [],
          antonyms: m.antonyms?.slice(0, 8) || [],
        }))

        return {
          word: entry.word,
          phonetic,
          audioUrl,
          origin: entry.origin || "",
          meanings,
          sourceUrl: entry.sourceUrls?.[0] || `https://en.wiktionary.org/wiki/${encodeURIComponent(entry.word)}`,
        }
      })
    )

    const definitions = results
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<any>).value)

    return NextResponse.json(definitions)
  } catch (error) {
    console.error("Dictionary API error:", error)
    return NextResponse.json([])
  }
}
