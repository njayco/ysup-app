import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = await request.json()
    const sessionId = parseInt(params.sessionId)

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 })
    }

    const sessionResult = await pool.query(
      "SELECT * FROM game_sessions WHERE id = $1",
      [sessionId]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 })
    }

    const session = sessionResult.rows[0]

    if (session.status === "ended") {
      return NextResponse.json({ success: true, message: "Session already ended" })
    }

    if (!session.coach_ybucks_awarded) {
      const coachYbucks = 250
      await pool.query(
        `INSERT INTO game_ybucks_awards (session_id, user_id, amount, reason)
         VALUES ($1, $2, $3, 'Coach bonus - session completed')`,
        [sessionId, parseInt(userId), coachYbucks]
      )

      await pool.query(
        "UPDATE users SET ybucks = ybucks + $1 WHERE id = $2",
        [coachYbucks, parseInt(userId)]
      )

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, meta)
         VALUES ($1, 'YBUCKS_EARNED', 'Coach Bonus!', $2, $3)`,
        [
          parseInt(userId),
          `You earned ${coachYbucks} YBucks as a coach bonus for completing your AI session!`,
          JSON.stringify({ amount: coachYbucks, sessionId, reason: "coach_bonus" }),
        ]
      )

      await pool.query(
        "UPDATE game_sessions SET coach_ybucks_awarded = TRUE WHERE id = $1",
        [sessionId]
      )
    }

    await pool.query(
      "UPDATE game_sessions SET status = 'ended', ended_at = NOW(), updated_at = NOW() WHERE id = $1",
      [sessionId]
    )

    const balanceResult = await pool.query(
      "SELECT ybucks FROM users WHERE id = $1",
      [parseInt(userId)]
    )

    const awardsResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM game_ybucks_awards WHERE session_id = $1 AND user_id = $2",
      [sessionId, parseInt(userId)]
    )

    return NextResponse.json({
      success: true,
      totalYbucksEarned: parseInt(awardsResult.rows[0]?.total || "0"),
      newBalance: balanceResult.rows[0]?.ybucks || 0,
    })
  } catch (error) {
    console.error("End session error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
