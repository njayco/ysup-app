import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId, userAnswer } = await request.json()
    const sessionId = parseInt(params.sessionId)

    if (!userId || !userAnswer) {
      return NextResponse.json({ success: false, message: "userId and userAnswer required" }, { status: 400 })
    }

    const sessionResult = await pool.query(
      "SELECT * FROM game_sessions WHERE id = $1 AND status = 'active'",
      [sessionId]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Session not found or ended" }, { status: 404 })
    }

    const ybucksAmount = 10

    await pool.query(
      "UPDATE users SET ybucks = ybucks + $1 WHERE id = $2",
      [ybucksAmount, parseInt(userId)]
    )

    await pool.query(
      `INSERT INTO game_ybucks_awards (session_id, user_id, amount, reason)
       VALUES ($1, $2, $3, $4)`,
      [sessionId, parseInt(userId), ybucksAmount, "Arrived at the answer"]
    )

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, meta)
       VALUES ($1, 'YBUCKS_EARNED', 'YBucks Earned!', $2, $3)`,
      [
        parseInt(userId),
        `You earned ${ybucksAmount} YBucks for arriving at the answer in your AI coaching session!`,
        JSON.stringify({ amount: ybucksAmount, sessionId, reason: "online_game_arrived" }),
      ]
    )

    await pool.query(
      "INSERT INTO game_chat_messages (session_id, role, content) VALUES ($1, 'user', $2)",
      [sessionId, `I think the answer is: ${userAnswer}`]
    )

    await pool.query(
      "INSERT INTO game_chat_messages (session_id, role, content) VALUES ($1, 'coach', $2)",
      [sessionId, `Great work! You've shown real understanding by working through that on your own. That's what learning is all about! 🎉\n\n+${ybucksAmount} YBucks earned!\n\nAre there any questions, class?`]
    )

    const balanceResult = await pool.query(
      "SELECT ybucks FROM users WHERE id = $1",
      [parseInt(userId)]
    )

    return NextResponse.json({
      success: true,
      ybucksAwarded: ybucksAmount,
      newBalance: balanceResult.rows[0]?.ybucks || 0,
    })
  } catch (error) {
    console.error("Arrived at answer error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
