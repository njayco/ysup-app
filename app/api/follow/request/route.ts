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
      `SELECT f.id, f.follower_id, f.created_at,
              u.username, u.first_name, u.last_name, u.profile_image, u.college
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [parseInt(userId)]
    )

    return NextResponse.json({ success: true, requests: result.rows })
  } catch (error) {
    console.error("Get follow requests error:", error)
    return NextResponse.json({ error: "Failed to get requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { followId, action, userId } = await request.json()

    if (!followId || !action || !userId) {
      return NextResponse.json({ error: "followId, action, and userId required" }, { status: 400 })
    }

    if (!["accept", "deny"].includes(action)) {
      return NextResponse.json({ error: "Action must be accept or deny" }, { status: 400 })
    }

    const followRow = await pool.query(
      `SELECT follower_id, following_id FROM follows WHERE id = $1 AND following_id = $2 AND status = 'pending'`,
      [followId, userId]
    )

    if (followRow.rows.length === 0) {
      return NextResponse.json({ error: "Follow request not found" }, { status: 404 })
    }

    const followerId = followRow.rows[0].follower_id

    if (action === "accept") {
      await pool.query(
        `UPDATE follows SET status = 'accepted' WHERE id = $1`,
        [followId]
      )

      const currentUser = await pool.query(`SELECT username, first_name, last_name FROM users WHERE id=$1`, [userId])
      const cu = currentUser.rows[0]
      if (cu) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, title, message, entity_type, entity_id, meta)
           VALUES ($1, $2, 'FOLLOW_ACCEPTED', 'Follow Request Accepted', $3, 'USER', $4, $5)`,
          [
            followerId,
            userId,
            `+${cu.username} accepted your follow request`,
            userId,
            JSON.stringify({ actorUsername: cu.username, actorName: `${cu.first_name} ${cu.last_name}` }),
          ]
        )
      }
    } else {
      await pool.query(
        `DELETE FROM follows WHERE id = $1`,
        [followId]
      )
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error("Follow request action error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
