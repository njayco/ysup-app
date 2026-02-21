import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, imageData } = body

    if (!userId || !imageData) {
      return NextResponse.json({ success: false, message: "userId and imageData required" }, { status: 400 })
    }

    if (imageData.length > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Image too large. Max 5MB." }, { status: 400 })
    }

    await pool.query(
      `UPDATE users SET profile_image = $1 WHERE id = $2`,
      [imageData, userId]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Profile image upload error:", err)
    return NextResponse.json({ success: false, message: "Failed to save profile image" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT profile_image FROM users WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profileImage: result.rows[0].profile_image || null,
    })
  } catch (err) {
    console.error("Profile image fetch error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch profile image" }, { status: 500 })
  }
}
