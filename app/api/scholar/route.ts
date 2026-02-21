import { NextResponse } from "next/server";

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

    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=en&num=10`;

    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    ];
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await fetch(url, {
      headers: {
        "User-Agent": ua,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
    });

    if (response.status === 429 || response.status === 503) {
      console.warn("Google Scholar rate limited, returning empty results");
      return NextResponse.json([]);
    }

    if (!response.ok) {
      console.error(`Google Scholar responded with status ${response.status}`);
      return NextResponse.json([]);
    }

    const html = await response.text();

    if (html.includes("unusual traffic") || html.includes("CAPTCHA")) {
      console.warn("Google Scholar CAPTCHA detected, returning empty results");
      return NextResponse.json([]);
    }

    const articles = parseScholarHTML(html);

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Scholar API error:", error);
    return NextResponse.json([]);
  }
}

interface ScholarArticle {
  id: string;
  title: string;
  authors: string;
  snippet: string;
  url: string;
  citedBy: number;
  year: string;
  source: string;
  pdfUrl: string;
}

function parseScholarHTML(html: string): ScholarArticle[] {
  const articles: ScholarArticle[] = [];

  const resultBlocks = html.split(/class="gs_r gs_or gs_scl"/);
  resultBlocks.shift();

  for (const block of resultBlocks) {
    try {
      const titleMatch = block.match(
        /class="gs_rt"[^>]*>(?:<a[^>]*href="([^"]*)"[^>]*>)?(?:<span[^>]*>[^<]*<\/span>)?\s*([\s\S]*?)(?:<\/a>|<\/h3>)/
      );
      let title = "";
      let url = "";
      if (titleMatch) {
        url = titleMatch[1] || "";
        title = titleMatch[2]?.replace(/<[^>]+>/g, "").trim() || "";
      }

      if (!title) continue;

      const authorMatch = block.match(/class="gs_a"[^>]*>([\s\S]*?)<\/div>/);
      let authors = "";
      let year = "";
      let source = "";
      if (authorMatch) {
        const authorText = authorMatch[1].replace(/<[^>]+>/g, "").trim();
        const parts = authorText.split(" - ");
        authors = parts[0]?.trim() || "";
        if (parts.length >= 2) {
          const yearMatch = parts[1]?.match(/\b(19|20)\d{2}\b/);
          year = yearMatch ? yearMatch[0] : "";
          source = parts[1]?.replace(/,?\s*\d{4}.*$/, "").trim() || "";
        }
        if (parts.length >= 3) {
          source = parts[1]?.replace(/,?\s*\d{4}.*$/, "").trim() || "";
        }
      }

      const snippetMatch = block.match(/class="gs_rs"[^>]*>([\s\S]*?)<\/div>/);
      let snippet = "";
      if (snippetMatch) {
        snippet = snippetMatch[1].replace(/<[^>]+>/g, "").trim();
      }

      const citedByMatch = block.match(/Cited by (\d+)/);
      const citedBy = citedByMatch ? parseInt(citedByMatch[1], 10) : 0;

      const pdfMatch = block.match(
        /class="gs_or_ggsm"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>/
      );
      const pdfUrl = pdfMatch ? pdfMatch[1] : "";

      articles.push({
        id: `scholar-${articles.length}`,
        title,
        authors,
        snippet,
        url,
        citedBy,
        year,
        source,
        pdfUrl,
      });
    } catch {
      continue;
    }
  }

  return articles;
}
