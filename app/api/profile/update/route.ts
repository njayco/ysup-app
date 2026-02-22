import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, bio, headline, major, graduationYear } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    await pool.query(
      `UPDATE users SET bio = $1, headline = $2, major = $3, graduation_year = $4 WHERE id = $5`,
      [bio || "", headline || "", major || "", graduationYear || "", userId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
