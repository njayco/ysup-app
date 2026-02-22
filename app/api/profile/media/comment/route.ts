import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { mediaId, userId, body: commentBody } = await request.json()

    if (!mediaId || !userId || !commentBody?.trim()) {
      return NextResponse.json({ error: "mediaId, userId, and body required" }, { status: 400 })
    }

    const mentionRegex = /\+([a-zA-Z0-9_.]+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(commentBody)) !== null) {
      mentions.push(match[1].toLowerCase())
    }

    const result = await pool.query(
      `INSERT INTO profile_media_comments (media_id, user_id, body, mentions) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [mediaId, userId, commentBody.trim(), mentions]
    )

    const userResult = await pool.query(
      `SELECT username, first_name, last_name, profile_image FROM users WHERE id=$1`,
      [userId]
    )

    const user = userResult.rows[0]

    return NextResponse.json({
      success: true,
      comment: {
        id: result.rows[0].id,
        body: commentBody.trim(),
        mentions,
        createdAt: result.rows[0].created_at,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
      },
    })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get("mediaId")

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT pmc.id, pmc.body, pmc.mentions, pmc.created_at,
              u.username, u.first_name, u.last_name, u.profile_image
       FROM profile_media_comments pmc
       JOIN users u ON pmc.user_id = u.id
       WHERE pmc.media_id = $1
       ORDER BY pmc.created_at ASC`,
      [mediaId]
    )

    return NextResponse.json(
      result.rows.map((r: any) => ({
        id: r.id,
        body: r.body,
        mentions: r.mentions,
        createdAt: r.created_at,
        username: r.username,
        firstName: r.first_name,
        lastName: r.last_name,
        profileImage: r.profile_image,
      }))
    )
  } catch (error) {
    console.error("Comments fetch error:", error)
    return NextResponse.json([])
  }
}
