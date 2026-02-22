import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const viewerId = searchParams.get("viewerId")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const normalizedUsername = username.trim().toLowerCase().replace(/^\+/, "")

    const userResult = await pool.query(
      `SELECT id, username, first_name, last_name, college, profile_image, bio, headline, status_note, major, graduation_year, created_at, ybucks, profile_visibility
       FROM users WHERE LOWER(REPLACE(username, '+', '')) = $1`,
      [normalizedUsername]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    const isPrivate = user.profile_visibility === "private"
    const isOwner = viewerId && parseInt(viewerId) === user.id

    let canViewFullProfile = !isPrivate || isOwner

    if (isPrivate && !isOwner && viewerId) {
      const followCheck = await pool.query(
        `SELECT id FROM follows WHERE follower_id=$1 AND following_id=$2 AND status='accepted'`,
        [parseInt(viewerId), user.id]
      )
      canViewFullProfile = followCheck.rows.length > 0
    }

    const userResponse: any = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      college: user.college,
      profileImage: user.profile_image,
      createdAt: user.created_at,
      profileVisibility: user.profile_visibility || "public",
      ybucks: user.ybucks || 0,
    }

    if (canViewFullProfile) {
      userResponse.bio = user.bio || ""
      userResponse.headline = user.headline || ""
      userResponse.statusNote = user.status_note || ""
      userResponse.major = user.major || ""
      userResponse.graduationYear = user.graduation_year || ""

      const resumeResult = await pool.query(
        `SELECT id, type, title, org, start_date, end_date, is_current, description, url, sort_order
         FROM profile_resume_sections WHERE user_id = $1 ORDER BY sort_order ASC, created_at DESC`,
        [user.id]
      )

      const mediaResult = await pool.query(
        `SELECT pm.id, pm.type, pm.data, pm.caption, pm.created_at,
                (SELECT COUNT(*) FROM profile_media_trues WHERE media_id = pm.id) as true_count,
                (SELECT COUNT(*) FROM profile_media_comments WHERE media_id = pm.id) as comment_count
         FROM profile_media pm WHERE pm.user_id = $1 ORDER BY pm.created_at DESC`,
        [user.id]
      )

      return NextResponse.json({
        user: userResponse,
        resume: resumeResult.rows,
        media: mediaResult.rows.map((m: any) => ({
          id: m.id,
          type: m.type,
          data: m.data,
          caption: m.caption,
          createdAt: m.created_at,
          trueCount: parseInt(m.true_count),
          commentCount: parseInt(m.comment_count),
        })),
        canViewFullProfile: true,
      })
    }

    return NextResponse.json({
      user: userResponse,
      resume: [],
      media: [],
      canViewFullProfile: false,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}
