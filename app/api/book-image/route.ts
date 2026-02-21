import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    if (
      !url.includes("books.google.com") &&
      !url.includes("googleapis.com")
    ) {
      return new NextResponse("Invalid image URL", { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Book image proxy error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
