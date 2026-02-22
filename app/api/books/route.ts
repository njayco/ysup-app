import { NextResponse } from "next/server";
import { getCachedResults, setCachedResults } from "@/lib/search-cache";

export const dynamic = 'force-dynamic'

const CACHE_SOURCE = "books"

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

    const cached = await getCachedResults(query, CACHE_SOURCE);
    if (cached) {
      return NextResponse.json(cached);
    }

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`;
    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const response = await fetch(url);

    if (response.status === 429) {
      const fallbackBooks = await generateFallbackResults(query);
      await setCachedResults(query, CACHE_SOURCE, fallbackBooks);
      return NextResponse.json(fallbackBooks);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.error?.status === "RESOURCE_EXHAUSTED") {
        const fallbackBooks = await generateFallbackResults(query);
        await setCachedResults(query, CACHE_SOURCE, fallbackBooks);
        return NextResponse.json(fallbackBooks);
      }
      throw new Error(`Google Books API responded with status ${response.status}`);
    }

    const data = await response.json();

    const books = (data.items || []).map((item: any) => {
      let thumbnail = item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail || "";
      if (thumbnail.startsWith("http://")) {
        thumbnail = thumbnail.replace("http://", "https://");
      }
      return {
        id: item.id,
        title: item.volumeInfo?.title || "Untitled",
        authors: item.volumeInfo?.authors || [],
        description: item.volumeInfo?.description || "",
        thumbnail,
        publishedDate: item.volumeInfo?.publishedDate || "",
        pageCount: item.volumeInfo?.pageCount || 0,
        previewLink: item.volumeInfo?.previewLink || "",
        infoLink: item.volumeInfo?.infoLink || "",
      };
    });

    await setCachedResults(query, CACHE_SOURCE, books);
    return NextResponse.json(books);
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

function generateFallbackResults(query: string) {
  const openLibraryUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`;
  return fetch(openLibraryUrl)
    .then((res) => res.json())
    .then((data) => {
      return (data.docs || []).slice(0, 12).map((doc: any) => ({
        id: doc.key || `ol-${doc.cover_edition_key || Math.random()}`,
        title: doc.title || "Untitled",
        authors: doc.author_name || [],
        description: doc.first_sentence?.join(" ") || "",
        thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
        publishedDate: doc.first_publish_year?.toString() || "",
        pageCount: doc.number_of_pages_median || 0,
        previewLink: doc.key ? `https://openlibrary.org${doc.key}` : "",
        infoLink: doc.key ? `https://openlibrary.org${doc.key}` : "",
      }));
    })
    .catch(() => []);
}
