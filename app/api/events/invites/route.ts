import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ success: false, message: "userId required" }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `SELECT 
        ei.id AS invite_id,
        ei.rsvp,
        ei.invited_at,
        ce.id AS event_id,
        ce.title,
        ce.description,
        ce.event_date,
        ce.event_time,
        ce.location,
        u.first_name AS creator_first_name,
        u.last_name AS creator_last_name,
        u.username AS creator_username
      FROM event_invites ei
      JOIN calendar_events ce ON ce.id = ei.event_id
      JOIN users u ON u.id = ce.creator_id
      WHERE ei.user_id = $1 AND ei.rsvp = 'pending'
      ORDER BY ce.event_date ASC, ce.event_time ASC`,
      [userId]
    )

    return NextResponse.json({ success: true, invites: result.rows })
  } catch (err) {
    console.error("Fetch invites error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch invites" }, { status: 500 })
  }
}
