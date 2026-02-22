import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const userResult = await pool.query(
      "SELECT id, first_name, last_name, username FROM users WHERE id = $1",
      [parseInt(userId)]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    const sessionResult = await pool.query(
      `INSERT INTO game_sessions (mode, status, creator_user_id)
       VALUES ('online_ai', 'active', $1)
       RETURNING id`,
      [user.id]
    )

    const sessionId = sessionResult.rows[0].id

    await pool.query(
      `INSERT INTO game_session_players (session_id, user_id, first_name, last_name, username)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, user.id, user.first_name, user.last_name, user.username]
    )

    const systemMessage = `You are "YsUp AI Coach", a Socratic tutor on a chalkboard. Your absolute rules:
- NEVER provide direct answers, definitions, or final solutions
- NEVER say "The answer is..." or give away the conclusion
- Always guide with hints, recall questions, process questions, examples, similes, metaphors, and step-by-step reasoning prompts
- If the user asks for the answer directly, refuse politely and reframe with a hint
- Keep responses short and chalkboard-friendly (2-8 lines)
- End some turns with a question back to the user to keep them thinking
- Use a warm, encouraging coaching tone
- When the user seems to have arrived at the answer, respond with brief encouragement followed by: "Are there any questions, class?"`

    await pool.query(
      `INSERT INTO game_chat_messages (session_id, role, content)
       VALUES ($1, 'system', $2)`,
      [sessionId, systemMessage]
    )

    await pool.query(
      `INSERT INTO game_chat_messages (session_id, role, content)
       VALUES ($1, 'coach', $2)`,
      [sessionId, "Welcome to YsUp AI Coach! 🎓\n\nI'm here to help you learn — but I won't just hand you the answers. Instead, I'll guide you with questions, hints, and examples so YOU discover the answer yourself.\n\nWhat topic or question would you like to explore today?"]
    )

    return NextResponse.json({
      success: true,
      sessionId: sessionId.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Start online game error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
