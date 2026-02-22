import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT profile_visibility FROM users WHERE id = $1`,
      [parseInt(userId)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ visibility: result.rows[0].profile_visibility || "public" })
  } catch (error) {
    console.error("Get visibility error:", error)
    return NextResponse.json({ error: "Failed to get visibility" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, visibility } = await request.json()

    if (!userId || !["public", "private"].includes(visibility)) {
      return NextResponse.json({ error: "userId and visibility (public/private) required" }, { status: 400 })
    }

    await pool.query(
      `UPDATE users SET profile_visibility = $2 WHERE id = $1`,
      [userId, visibility]
    )

    return NextResponse.json({ success: true, visibility })
  } catch (error) {
    console.error("Set visibility error:", error)
    return NextResponse.json({ error: "Failed to set visibility" }, { status: 500 })
  }
}
