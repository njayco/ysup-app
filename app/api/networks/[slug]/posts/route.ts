import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { userId, content } = body

    if (!userId || !content?.trim()) {
      return NextResponse.json({ success: false, message: "User ID and content required" }, { status: 400 })
    }

    const parsedUserId = parseInt(userId)

    const networkResult = await pool.query(
      "SELECT id FROM class_networks WHERE slug = $1",
      [params.slug]
    )

    if (networkResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Network not found" }, { status: 404 })
    }

    const networkId = networkResult.rows[0].id

    const memberCheck = await pool.query(
      "SELECT id FROM network_members WHERE network_id = $1 AND user_id = $2",
      [networkId, parsedUserId]
    )

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Must be a member to post" }, { status: 403 })
    }

    const postResult = await pool.query(
      `INSERT INTO network_posts (network_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [networkId, parsedUserId, content.trim()]
    )

    const post = postResult.rows[0]

    const userResult = await pool.query(
      "SELECT first_name, last_name, username FROM users WHERE id = $1",
      [parsedUserId]
    )

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        author_first_name: userResult.rows[0].first_name,
        author_last_name: userResult.rows[0].last_name,
        author_username: userResult.rows[0].username,
        responses: [],
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
