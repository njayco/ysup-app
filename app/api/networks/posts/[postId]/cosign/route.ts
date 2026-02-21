import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const postResult = await pool.query(
      "SELECT network_id FROM network_posts WHERE id = $1",
      [parseInt(params.postId)]
    )

    if (postResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 })
    }

    const memberCheck = await pool.query(
      "SELECT id FROM network_members WHERE network_id = $1 AND user_id = $2",
      [postResult.rows[0].network_id, parseInt(userId)]
    )

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Must be a member to co-sign" }, { status: 403 })
    }

    const result = await pool.query(
      "UPDATE network_posts SET cosigns = cosigns + 1 WHERE id = $1 RETURNING cosigns",
      [parseInt(params.postId)]
    )

    return NextResponse.json({ success: true, cosigns: result.rows[0].cosigns })
  } catch (error) {
    console.error("Cosign error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
