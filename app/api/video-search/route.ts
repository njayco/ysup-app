import { NextResponse } from "next/server"
import { getCachedResults, setCachedResults } from "@/lib/search-cache"

export const dynamic = "force-dynamic"

const CACHE_SOURCE = "video-search"

interface VideoResult {
  id: string
  title: string
  description: string
  url: string
  embedUrl: string
  thumbnail: string
  duration: string
  published: string
  publisher: string
  viewCount: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    const cached = await getCachedResults(query, CACHE_SOURCE)
    if (cached) {
      return NextResponse.json(cached)
    }

    const vqd = await getVQD(query)
    if (!vqd) {
      return NextResponse.json([])
    }

    const url = `https://duckduckgo.com/v.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://duckduckgo.com/",
      },
    })

    if (!response.ok) {
      console.error(`DDG videos responded with status ${response.status}`)
      return NextResponse.json([])
    }

    const data = await response.json()
    const results: VideoResult[] = (data.results || []).slice(0, 20).map((vid: any, i: number) => ({
      id: `vid-${i}`,
      title: vid.title || "",
      description: vid.description || vid.content || "",
      url: vid.content || vid.url || "",
      embedUrl: vid.embed_url || "",
      thumbnail: vid.images?.large || vid.images?.medium || vid.images?.small || vid.image || "",
      duration: vid.duration || "",
      published: vid.published || "",
      publisher: vid.publisher || vid.uploader || "",
      viewCount: vid.statistics?.viewCount || 0,
    }))

    await setCachedResults(query, CACHE_SOURCE, results)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Video search error:", error)
    return NextResponse.json([])
  }
}

async function getVQD(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })
    const html = await res.text()
    const match = html.match(/vqd=["']?([^"'&]+)/) || html.match(/vqd=([\d-]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
