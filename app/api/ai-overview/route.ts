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
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const cacheKey = crypto
      .createHash("md5")
      .update(`ai-overview:${query.toLowerCase().trim()}`)
      .digest("hex");

    const cached = await getPool().query(
      "SELECT summary_text FROM summary_cache WHERE cache_key = $1",
      [cacheKey]
    );

    if (cached.rows.length > 0) {
      return NextResponse.json({ overview: cached.rows[0].summary_text });
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an academic search assistant for college students. When given a search query, provide a brief, informative overview (3-4 sentences) that helps the student understand the topic. Include key facts, context, and academic relevance. Be concise and educational. Do not use markdown formatting or bullet points - write in plain flowing text.",
        },
        {
          role: "user",
          content: `Provide a brief academic overview for the search query: "${query}"`,
        },
      ],
      max_tokens: 200,
    });

    const overview =
      completion.choices[0]?.message?.content ||
      "Unable to generate overview.";

    await getPool().query(
      `INSERT INTO summary_cache (query, source, item_id, item_title, summary_text, cache_key)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [query, "ai-overview", query, query, overview, cacheKey]
    );

    return NextResponse.json({ overview });
  } catch (error) {
    console.error("AI Overview error:", error);
    return NextResponse.json(
      { error: "Failed to generate overview" },
      { status: 500 }
    );
  }
}
