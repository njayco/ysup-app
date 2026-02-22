import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [parseInt(userId)]
    )

    const unreadCount = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE",
      [parseInt(userId)]
    )

    return NextResponse.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0]?.count || "0"),
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
