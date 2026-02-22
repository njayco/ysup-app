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
      "SELECT np.network_id, np.user_id as author_id, np.content, cn.name as network_name FROM network_posts np JOIN class_networks cn ON cn.id = np.network_id WHERE np.id = $1",
      [parseInt(params.postId)]
    )

    if (postResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 })
    }

    const post = postResult.rows[0]

    const memberCheck = await pool.query(
      "SELECT id FROM network_members WHERE network_id = $1 AND user_id = $2",
      [post.network_id, parseInt(userId)]
    )

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Must be a member to co-sign" }, { status: 403 })
    }

    const result = await pool.query(
      "UPDATE network_posts SET cosigns = cosigns + 1 WHERE id = $1 RETURNING cosigns",
      [parseInt(params.postId)]
    )

    if (post.author_id && post.author_id !== parseInt(userId)) {
      const cosigner = await pool.query(
        "SELECT first_name, last_name FROM users WHERE id = $1",
        [parseInt(userId)]
      )
      const cosignerName = cosigner.rows[0]
        ? `${cosigner.rows[0].first_name} ${cosigner.rows[0].last_name}`
        : "Someone"

      const snippet = post.content.length > 50 ? post.content.slice(0, 50) + "..." : post.content

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, meta)
         VALUES ($1, 'general', 'TRUE on your post!', $2, $3)`,
        [
          post.author_id,
          `${cosignerName} co-signed your post in ${post.network_name}: "${snippet}"`,
          JSON.stringify({ postId: parseInt(params.postId), cosignerId: parseInt(userId) }),
        ]
      )
    }

    return NextResponse.json({ success: true, cosigns: result.rows[0].cosigns })
  } catch (error) {
    console.error("Cosign error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
