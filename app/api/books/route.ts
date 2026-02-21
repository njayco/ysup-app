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

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`
    );

    if (!response.ok) {
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

    return NextResponse.json(books);
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
