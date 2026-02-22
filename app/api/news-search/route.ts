import { NextResponse } from "next/server"
import { getCachedResults, setCachedResults } from "@/lib/search-cache"

export const dynamic = "force-dynamic"

const CACHE_SOURCE = "news-search"

interface NewsResult {
  id: string
  title: string
  snippet: string
  url: string
  source: string
  date: string
  image: string
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

    const url = `https://duckduckgo.com/news.js?l=us-en&o=json&noamp=1&q=${encodeURIComponent(query)}&vqd=${vqd}&p=1&df=`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://duckduckgo.com/",
      },
    })

    if (!response.ok) {
      console.error(`DDG news responded with status ${response.status}`)
      return NextResponse.json([])
    }

    const data = await response.json()
    const results: NewsResult[] = (data.results || []).slice(0, 20).map((article: any, i: number) => ({
      id: `news-${i}`,
      title: article.title || "",
      snippet: article.excerpt || article.body || "",
      url: article.url || "",
      source: article.source || "",
      date: article.date ? new Date(article.date * 1000).toISOString() : article.relative_time || "",
      image: article.image || "",
    }))

    await setCachedResults(query, CACHE_SOURCE, results)
    return NextResponse.json(results)
  } catch (error) {
    console.error("News search error:", error)
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
