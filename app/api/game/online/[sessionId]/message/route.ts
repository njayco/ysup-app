import { NextResponse } from "next/server"
import pool from "@/lib/db"
import OpenAI from "openai"

export const dynamic = "force-dynamic"

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  }
  return _openai
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { question, userId } = await request.json()
    const sessionId = parseInt(params.sessionId)

    if (!question || !userId) {
      return NextResponse.json({ success: false, message: "Question and userId required" }, { status: 400 })
    }

    const sessionResult = await pool.query(
      "SELECT * FROM game_sessions WHERE id = $1 AND status = 'active'",
      [sessionId]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Session not found or ended" }, { status: 404 })
    }

    const playerCheck = await pool.query(
      "SELECT id FROM game_session_players WHERE session_id = $1 AND user_id = $2",
      [sessionId, parseInt(userId)]
    )

    if (playerCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Not authorized for this session" }, { status: 403 })
    }

    await pool.query(
      "INSERT INTO game_chat_messages (session_id, role, content) VALUES ($1, 'user', $2)",
      [sessionId, question]
    )

    const chatHistory = await pool.query(
      "SELECT role, content FROM game_chat_messages WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    )

    const messages = chatHistory.rows.map((msg) => ({
      role: msg.role === "coach" ? "assistant" as const : msg.role as "system" | "user",
      content: msg.content,
    }))

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_completion_tokens: 500,
    })

    let reply = completion.choices[0]?.message?.content || "Hmm, let me think about that differently. Can you rephrase your question?"

    const directAnswerPatterns = [
      /the answer is/i,
      /the definition is/i,
      /it means/i,
      /^it is /i,
      /the solution is/i,
    ]

    for (const pattern of directAnswerPatterns) {
      if (pattern.test(reply)) {
        reply = "Great question! Instead of telling you directly, let me ask you this — what do you already know about this topic? What comes to mind first? Let's build from there. 🤔"
        break
      }
    }

    await pool.query(
      "INSERT INTO game_chat_messages (session_id, role, content) VALUES ($1, 'coach', $2)",
      [sessionId, reply]
    )

    await pool.query(
      "UPDATE game_sessions SET updated_at = NOW() WHERE id = $1",
      [sessionId]
    )

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    console.error("Game message error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
