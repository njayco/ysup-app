import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { mediaId, userId } = await request.json()

    if (!mediaId || !userId) {
      return NextResponse.json({ error: "mediaId and userId required" }, { status: 400 })
    }

    const existing = await pool.query(
      `SELECT id FROM profile_media_trues WHERE media_id=$1 AND user_id=$2`,
      [mediaId, userId]
    )

    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM profile_media_trues WHERE media_id=$1 AND user_id=$2`, [mediaId, userId])
    } else {
      await pool.query(`INSERT INTO profile_media_trues (media_id, user_id) VALUES ($1, $2)`, [mediaId, userId])

      const mediaOwner = await pool.query(
        `SELECT pm.user_id as owner_id, u.username, u.first_name, u.last_name
         FROM profile_media pm
         JOIN users u ON u.id = $2
         WHERE pm.id = $1`,
        [mediaId, userId]
      )

      if (mediaOwner.rows.length > 0) {
        const row = mediaOwner.rows[0]
        const ownerId = row.owner_id
        if (ownerId !== userId) {
          await pool.query(
            `INSERT INTO notifications (user_id, actor_id, type, title, message, entity_type, entity_id, meta)
             VALUES ($1, $2, 'TRUE', 'New TRUE', $3, 'MEDIA', $4, $5)`,
            [
              ownerId,
              userId,
              `+${row.username} gave you a TRUE`,
              mediaId,
              JSON.stringify({ actorUsername: row.username, actorName: `${row.first_name} ${row.last_name}` }),
            ]
          )
        }
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM profile_media_trues WHERE media_id=$1`,
      [mediaId]
    )

    const isTrued = existing.rows.length === 0

    return NextResponse.json({
      success: true,
      trueCount: parseInt(countResult.rows[0].count),
      isTrued,
    })
  } catch (error) {
    console.error("TRUE toggle error:", error)
    return NextResponse.json({ error: "Failed to toggle TRUE" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get("mediaId")
    const userId = searchParams.get("userId")

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId required" }, { status: 400 })
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM profile_media_trues WHERE media_id=$1`,
      [mediaId]
    )

    let isTrued = false
    if (userId) {
      const check = await pool.query(
        `SELECT id FROM profile_media_trues WHERE media_id=$1 AND user_id=$2`,
        [mediaId, userId]
      )
      isTrued = check.rows.length > 0
    }

    return NextResponse.json({
      trueCount: parseInt(countResult.rows[0].count),
      isTrued,
    })
  } catch (error) {
    console.error("TRUE check error:", error)
    return NextResponse.json({ error: "Failed to check TRUE" }, { status: 500 })
  }
}
