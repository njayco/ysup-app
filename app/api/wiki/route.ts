import { NextResponse } from "next/server";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#039;/g, "'");
}

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

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=10&origin=*`
    );

    if (!response.ok) {
      throw new Error(`Wikipedia API responded with status ${response.status}`);
    }

    const data = await response.json();

    const articles = (data.query?.search || []).map((item: any) => ({
      pageid: item.pageid,
      title: item.title,
      snippet: stripHtml(item.snippet || ""),
      wordcount: item.wordcount || 0,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
    }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Wikipedia API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Wikipedia articles" },
      { status: 500 }
    );
  }
}
