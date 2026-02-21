import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const slug = params.slug

    const networkResult = await pool.query(
      `SELECT cn.*, 
        u.first_name as mod_first_name, u.last_name as mod_last_name, u.username as mod_username,
        (SELECT COUNT(*) FROM network_members WHERE network_id = cn.id) as member_count
      FROM class_networks cn
      JOIN users u ON u.id = cn.moderator_user_id
      WHERE cn.slug = $1`,
      [slug]
    )

    if (networkResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Network not found" }, { status: 404 })
    }

    const network = networkResult.rows[0]
    const parsedUserId = userId ? parseInt(userId) : null

    let isMember = false
    let joinStatus = "none"
    let canModerate = false

    if (parsedUserId) {
      const memberCheck = await pool.query(
        "SELECT id FROM network_members WHERE network_id = $1 AND user_id = $2",
        [network.id, parsedUserId]
      )
      isMember = memberCheck.rows.length > 0
      canModerate = network.moderator_user_id === parsedUserId

      if (!isMember) {
        const requestCheck = await pool.query(
          "SELECT status FROM network_join_requests WHERE network_id = $1 AND user_id = $2",
          [network.id, parsedUserId]
        )
        if (requestCheck.rows.length > 0) {
          joinStatus = requestCheck.rows[0].status
        }
      }
    }

    const membersResult = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.username
      FROM network_members nm
      JOIN users u ON u.id = nm.user_id
      WHERE nm.network_id = $1
      ORDER BY nm.joined_at`,
      [network.id]
    )

    let posts: unknown[] = []
    if (isMember) {
      const postsResult = await pool.query(
        `SELECT np.*, u.first_name as author_first_name, u.last_name as author_last_name, u.username as author_username
        FROM network_posts np
        JOIN users u ON u.id = np.author_id
        WHERE np.network_id = $1
        ORDER BY np.created_at DESC
        LIMIT 50`,
        [network.id]
      )

      const postIds = postsResult.rows.map((p: { id: number }) => p.id)
      let responsesMap: Record<number, unknown[]> = {}

      if (postIds.length > 0) {
        const responsesResult = await pool.query(
          `SELECT npr.*, u.first_name as author_first_name, u.last_name as author_last_name
          FROM network_post_responses npr
          JOIN users u ON u.id = npr.author_id
          WHERE npr.post_id = ANY($1)
          ORDER BY npr.created_at ASC`,
          [postIds]
        )
        for (const r of responsesResult.rows) {
          if (!responsesMap[r.post_id]) responsesMap[r.post_id] = []
          responsesMap[r.post_id].push(r)
        }
      }

      posts = postsResult.rows.map((p: { id: number }) => ({
        ...p,
        responses: responsesMap[p.id] || [],
      }))
    }

    return NextResponse.json({
      success: true,
      network,
      members: membersResult.rows,
      isMember,
      joinStatus,
      canModerate,
      posts,
    })
  } catch (error) {
    console.error("Get network error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
