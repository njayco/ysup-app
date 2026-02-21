import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      console.error(`DuckDuckGo responded with status ${response.status}`);
      return NextResponse.json([]);
    }

    const html = await response.text();
    const results = parseDDGResults(html);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Web search error:", error);
    return NextResponse.json([]);
  }
}

interface WebResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  displayUrl: string;
}

function parseDDGResults(html: string): WebResult[] {
  const results: WebResult[] = [];

  const resultBlocks = html.split(/class="result results_links results_links_deep web-result/);
  resultBlocks.shift();

  for (const block of resultBlocks) {
    try {
      const titleMatch = block.match(
        /class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/
      );
      if (!titleMatch) continue;

      let url = titleMatch[1] || "";
      const title = titleMatch[2]?.replace(/<[^>]+>/g, "").trim() || "";

      if (!title) continue;

      if (url.startsWith("//duckduckgo.com/l/?uddg=")) {
        const decoded = decodeURIComponent(
          url.replace("//duckduckgo.com/l/?uddg=", "").split("&")[0]
        );
        url = decoded;
      }

      const snippetMatch = block.match(
        /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/
      );
      const snippet = snippetMatch
        ? snippetMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      let displayUrl = url;
      try {
        const parsed = new URL(url);
        displayUrl = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
        if (displayUrl.length > 60) {
          displayUrl = displayUrl.substring(0, 57) + "...";
        }
      } catch {
        displayUrl = url.substring(0, 60);
      }

      results.push({
        id: `web-${results.length}`,
        title,
        snippet,
        url,
        displayUrl,
      });

      if (results.length >= 10) break;
    } catch {
      continue;
    }
  }

  return results;
}
