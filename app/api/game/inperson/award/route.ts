import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { username, amount, reason, sessionId } = await request.json()

    if (!username || !amount) {
      return NextResponse.json({ success: false, message: "username and amount required" }, { status: 400 })
    }

    const cleanUsername = username.startsWith("+") ? username.slice(1) : username

    const userResult = await pool.query(
      "SELECT id, username, ybucks FROM users WHERE username = $1",
      [cleanUsername.toLowerCase()]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    await pool.query(
      "UPDATE users SET ybucks = ybucks + $1 WHERE id = $2",
      [parseInt(amount), user.id]
    )

    if (sessionId) {
      await pool.query(
        `INSERT INTO game_ybucks_awards (session_id, user_id, amount, reason)
         VALUES ($1, $2, $3, $4)`,
        [parseInt(sessionId), user.id, parseInt(amount), reason || "In-person game award"]
      )
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, meta)
       VALUES ($1, 'YBUCKS_EARNED', 'YBucks Earned!', $2, $3)`,
      [
        user.id,
        `You earned ${amount} YBucks from an in-person YsUp game session!`,
        JSON.stringify({ amount: parseInt(amount), reason: reason || "in_person_game", sessionId }),
      ]
    )

    const updatedUser = await pool.query("SELECT ybucks FROM users WHERE id = $1", [user.id])

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.rows[0]?.ybucks || 0,
    })
  } catch (error) {
    console.error("In-person award error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
