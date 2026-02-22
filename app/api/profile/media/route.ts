import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, data, caption } = body

    if (!userId || !data) {
      return NextResponse.json({ error: "userId and data required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO profile_media (user_id, type, data, caption) VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, type || "image", data, caption || ""]
    )

    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error) {
    console.error("Media upload error:", error)
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId required" }, { status: 400 })
    }

    await pool.query(`DELETE FROM profile_media WHERE id=$1 AND user_id=$2`, [id, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Media delete error:", error)
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
  }
}
