import { NextResponse } from "next/server";
import { Pool } from "pg";
import OpenAI from "openai";
import crypto from "crypto";

let _pool: Pool | null = null;
function getPool() {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI();
  }
  return _openai;
}

function generateCacheKey(source: string, itemId: string): string {
  return crypto.createHash("md5").update(`${source}:${itemId}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { title, description, source, itemId } = await request.json();

    if (!title || !source || !itemId) {
      return NextResponse.json(
        { error: "title, source, and itemId are required" },
        { status: 400 }
      );
    }

    const cacheKey = generateCacheKey(source, itemId);

    const cached = await getPool().query(
      "SELECT summary_text FROM summary_cache WHERE cache_key = $1",
      [cacheKey]
    );

    if (cached.rows.length > 0) {
      return NextResponse.json({ summary: cached.rows[0].summary_text });
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an academic assistant helping college students understand books and articles. Provide clear, concise summaries that highlight key concepts, main arguments, and academic relevance. Keep summaries informative and accessible.",
        },
        {
          role: "user",
          content: `Please provide a brief academic summary of the following:\n\nTitle: ${title}\n\nDescription: ${description || "No description available."}`,
        },
      ],
      max_tokens: 300,
    });

    const summary = completion.choices[0]?.message?.content || "Unable to generate summary.";

    await getPool().query(
      `INSERT INTO summary_cache (query, source, item_id, item_title, summary_text, cache_key)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, source, itemId, title, summary, cacheKey]
    );

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
