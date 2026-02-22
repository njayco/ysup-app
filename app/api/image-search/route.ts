import { NextResponse } from "next/server"
import { getCachedResults, setCachedResults } from "@/lib/search-cache"

export const dynamic = "force-dynamic"

const CACHE_SOURCE = "image-search"

interface ImageResult {
  id: string
  title: string
  image: string
  thumbnail: string
  url: string
  width: number
  height: number
  source: string
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

    const url = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://duckduckgo.com/",
      },
    })

    if (!response.ok) {
      console.error(`DDG images responded with status ${response.status}`)
      return NextResponse.json([])
    }

    const data = await response.json()
    const results: ImageResult[] = (data.results || []).slice(0, 30).map((img: any, i: number) => ({
      id: `img-${i}`,
      title: img.title || "",
      image: img.image || "",
      thumbnail: img.thumbnail || img.image || "",
      url: img.url || "",
      width: img.width || 0,
      height: img.height || 0,
      source: img.source || "",
    }))

    await setCachedResults(query, CACHE_SOURCE, results)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Image search error:", error)
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
