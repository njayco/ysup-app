import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, userId, rsvp } = body

    if (!eventId || !userId || !rsvp) {
      return NextResponse.json({ success: false, message: "eventId, userId, and rsvp required" }, { status: 400 })
    }

    const validRsvps = ["going", "maybe", "not_going"]
    if (!validRsvps.includes(rsvp)) {
      return NextResponse.json({ success: false, message: "rsvp must be going, maybe, or not_going" }, { status: 400 })
    }

    await pool.query(
      `UPDATE event_invites SET rsvp = $1, responded_at = NOW() WHERE event_id = $2 AND user_id = $3`,
      [rsvp, eventId, userId]
    )

    const tallies = await pool.query(
      `SELECT 
        COUNT(*) AS total_invited,
        COUNT(*) FILTER (WHERE rsvp = 'going') AS going_count,
        COUNT(*) FILTER (WHERE rsvp = 'maybe') AS maybe_count,
        COUNT(*) FILTER (WHERE rsvp = 'not_going') AS not_going_count
      FROM event_invites WHERE event_id = $1`,
      [eventId]
    )

    return NextResponse.json({
      success: true,
      tallies: tallies.rows[0],
    })
  } catch (err) {
    console.error("RSVP error:", err)
    return NextResponse.json({ success: false, message: "Failed to update RSVP" }, { status: 500 })
  }
}
