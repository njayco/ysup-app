import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { userId, statusNote } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const trimmed = (statusNote || "").slice(0, 80)
    await pool.query(`UPDATE users SET status_note = $1 WHERE id = $2`, [trimmed, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
