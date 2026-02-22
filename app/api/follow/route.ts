import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { followerId, followingId } = await request.json()

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "followerId and followingId required" }, { status: 400 })
    }

    if (followerId === followingId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const existing = await pool.query(
      `SELECT id FROM follows WHERE follower_id=$1 AND following_id=$2`,
      [followerId, followingId]
    )

    if (existing.rows.length > 0) {
      const stats = await getFollowStats(followingId, followerId)
      return NextResponse.json({ success: true, ...stats })
    }

    await pool.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
      [followerId, followingId]
    )

    const followerUser = await pool.query(`SELECT username, first_name, last_name FROM users WHERE id=$1`, [followerId])
    const fname = followerUser.rows[0]
    if (fname) {
      await pool.query(
        `INSERT INTO notifications (user_id, actor_id, type, title, message, entity_type, entity_id, meta)
         VALUES ($1, $2, 'FOLLOW', 'New Follower', $3, 'USER', $4, $5)`,
        [
          followingId,
          followerId,
          `+${fname.username} followed you`,
          followerId,
          JSON.stringify({ actorUsername: fname.username, actorName: `${fname.first_name} ${fname.last_name}` }),
        ]
      )
    }

    const stats = await getFollowStats(followingId, followerId)
    return NextResponse.json({ success: true, ...stats })
  } catch (error) {
    console.error("Follow error:", error)
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get("followerId")
    const followingId = searchParams.get("followingId")

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "followerId and followingId required" }, { status: 400 })
    }

    await pool.query(
      `DELETE FROM follows WHERE follower_id=$1 AND following_id=$2`,
      [followerId, followingId]
    )

    const stats = await getFollowStats(parseInt(followingId), parseInt(followerId))
    return NextResponse.json({ success: true, ...stats })
  } catch (error) {
    console.error("Unfollow error:", error)
    return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const viewerId = searchParams.get("viewerId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const stats = await getFollowStats(parseInt(userId), viewerId ? parseInt(viewerId) : null)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Follow stats error:", error)
    return NextResponse.json({ error: "Failed to get follow stats" }, { status: 500 })
  }
}

async function getFollowStats(userId: number, viewerId: number | null) {
  const [followersRes, followingRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) as count FROM follows WHERE following_id=$1`, [userId]),
    pool.query(`SELECT COUNT(*) as count FROM follows WHERE follower_id=$1`, [userId]),
  ])

  let isFollowing = false
  if (viewerId && viewerId !== userId) {
    const check = await pool.query(
      `SELECT id FROM follows WHERE follower_id=$1 AND following_id=$2`,
      [viewerId, userId]
    )
    isFollowing = check.rows.length > 0
  }

  return {
    followersCount: parseInt(followersRes.rows[0].count),
    followingCount: parseInt(followingRes.rows[0].count),
    isFollowing,
  }
}
