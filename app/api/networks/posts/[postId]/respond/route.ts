import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await request.json()
    const { userId, content } = body

    if (!userId || !content?.trim()) {
      return NextResponse.json({ success: false, message: "User ID and content required" }, { status: 400 })
    }

    const parsedUserId = parseInt(userId)

    const postResult = await pool.query(
      "SELECT network_id FROM network_posts WHERE id = $1",
      [parseInt(params.postId)]
    )

    if (postResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 })
    }

    const memberCheck = await pool.query(
      "SELECT id FROM network_members WHERE network_id = $1 AND user_id = $2",
      [postResult.rows[0].network_id, parsedUserId]
    )

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Must be a member to respond" }, { status: 403 })
    }

    const result = await pool.query(
      `INSERT INTO network_post_responses (post_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [parseInt(params.postId), parsedUserId, content.trim()]
    )

    const response = result.rows[0]

    const userResult = await pool.query(
      "SELECT first_name, last_name FROM users WHERE id = $1",
      [parsedUserId]
    )

    return NextResponse.json({
      success: true,
      response: {
        ...response,
        author_first_name: userResult.rows[0].first_name,
        author_last_name: userResult.rows[0].last_name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Respond error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
