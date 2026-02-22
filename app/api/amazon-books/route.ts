import { NextResponse } from "next/server";
import { getCachedResults, setCachedResults } from "@/lib/search-cache";

export const dynamic = 'force-dynamic'

const CACHE_SOURCE = "amazon-books"

interface AmazonBook {
  id: string
  title: string
  authors: string[]
  description: string
  publishedDate: string
  pageCount: number
  rating: number
  ratingsCount: number
  isbn: string
  amazonUrl: string
  categories: string[]
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

    const cached = await getCachedResults(query, CACHE_SOURCE);
    if (cached) {
      return NextResponse.json(cached);
    }

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&printType=books`;
    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        const fallback = await fetchOpenLibraryFallback(query);
        await setCachedResults(query, CACHE_SOURCE, fallback);
        return NextResponse.json(fallback);
      }
      throw new Error(`Google Books API responded with status ${response.status}`);
    }

    const data = await response.json();

    const books: AmazonBook[] = (data.items || []).map((item: any) => {
      const info = item.volumeInfo || {};
      const isbn13 = info.industryIdentifiers?.find((id: any) => id.type === "ISBN_13")?.identifier || "";
      const isbn10 = info.industryIdentifiers?.find((id: any) => id.type === "ISBN_10")?.identifier || "";
      const isbn = isbn13 || isbn10;

      let amazonUrl = "";
      if (isbn) {
        amazonUrl = `https://www.amazon.com/dp/${isbn10 || isbn13}`;
      } else {
        amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(info.title || query)}&i=stripbooks`;
      }

      return {
        id: item.id,
        title: info.title || "Untitled",
        authors: info.authors || [],
        description: info.description || info.subtitle || "",
        publishedDate: info.publishedDate || "",
        pageCount: info.pageCount || 0,
        rating: info.averageRating || 0,
        ratingsCount: info.ratingsCount || 0,
        isbn,
        amazonUrl,
        categories: info.categories || [],
      };
    });

    await setCachedResults(query, CACHE_SOURCE, books);
    return NextResponse.json(books);
  } catch (error) {
    console.error("Amazon Books API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Amazon books" },
      { status: 500 }
    );
  }
}

async function fetchOpenLibraryFallback(query: string): Promise<AmazonBook[]> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`);
    const data = await res.json();
    return (data.docs || []).slice(0, 12).map((doc: any) => {
      const isbn13 = doc.isbn?.[0] || "";
      const amazonUrl = isbn13
        ? `https://www.amazon.com/dp/${isbn13}`
        : `https://www.amazon.com/s?k=${encodeURIComponent(doc.title || query)}&i=stripbooks`;

      return {
        id: doc.key || `ol-${Math.random().toString(36).slice(2)}`,
        title: doc.title || "Untitled",
        authors: doc.author_name || [],
        description: doc.first_sentence?.join(" ") || "",
        publishedDate: doc.first_publish_year?.toString() || "",
        pageCount: doc.number_of_pages_median || 0,
        rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : 0,
        ratingsCount: doc.ratings_count || 0,
        isbn: isbn13,
        amazonUrl,
        categories: doc.subject?.slice(0, 3) || [],
      };
    });
  } catch {
    return [];
  }
}
