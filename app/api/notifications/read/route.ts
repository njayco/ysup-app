import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request) {
  try {
    const { userId, notificationId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 })
    }

    if (notificationId) {
      await pool.query(
        "UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2",
        [parseInt(notificationId), parseInt(userId)]
      )
    } else {
      await pool.query(
        "UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE",
        [parseInt(userId)]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notification read error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
