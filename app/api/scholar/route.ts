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

    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=12&select=id,title,authorships,publication_year,cited_by_count,doi,primary_location,abstract_inverted_index,open_access&mailto=campus@ysup.edu`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`OpenAlex API responded with status ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();

    const articles = (data.results || []).map((work: any, index: number) => {
      const authors = (work.authorships || [])
        .map((a: any) => a.author?.display_name)
        .filter(Boolean)
        .join(", ");

      const year = work.publication_year?.toString() || "";

      const source =
        work.primary_location?.source?.display_name || "";

      let articleUrl = "";
      if (work.doi) {
        articleUrl = work.doi.startsWith("http")
          ? work.doi
          : `https://doi.org/${work.doi}`;
      } else if (work.primary_location?.landing_page_url) {
        articleUrl = work.primary_location.landing_page_url;
      }

      const pdfUrl = work.open_access?.oa_url || work.primary_location?.pdf_url || "";

      let snippet = "";
      if (work.abstract_inverted_index) {
        const wordPositions: [string, number][] = [];
        for (const [word, positions] of Object.entries(
          work.abstract_inverted_index
        )) {
          for (const pos of positions as number[]) {
            wordPositions.push([word, pos]);
          }
        }
        wordPositions.sort((a, b) => a[1] - b[1]);
        snippet = wordPositions.map((wp) => wp[0]).join(" ");
        if (snippet.length > 300) {
          snippet = snippet.substring(0, 300) + "...";
        }
      }

      const citedBy = work.cited_by_count || 0;

      return {
        id: `scholar-${index}`,
        title: work.title || "Untitled",
        authors,
        snippet,
        url: articleUrl,
        citedBy,
        year,
        source,
        pdfUrl,
      };
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Scholar API error:", error);
    return NextResponse.json([]);
  }
}
