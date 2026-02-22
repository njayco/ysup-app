import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, firstName, lastName, phone, college, major, graduationYear, bio, headline, statusNote } = body

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    await pool.query(
      `UPDATE users SET
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        college = COALESCE($5, college),
        major = COALESCE($6, major),
        graduation_year = COALESCE($7, graduation_year),
        bio = COALESCE($8, bio),
        headline = COALESCE($9, headline),
        status_note = COALESCE($10, status_note)
       WHERE id = $1`,
      [userId, firstName, lastName, phone, college, major, graduationYear, bio, headline, statusNote]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile sync error:", error)
    return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 })
  }
}
