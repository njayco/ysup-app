import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, userId } = body

    if (!eventId || !userId) {
      return NextResponse.json({ success: false, message: "eventId and userId required" }, { status: 400 })
    }

    const event = await pool.query(
      `SELECT creator_id FROM calendar_events WHERE id = $1`,
      [eventId]
    )

    if (event.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    if (event.rows[0].creator_id !== parseInt(userId)) {
      return NextResponse.json({ success: false, message: "Only the creator can delete this event" }, { status: 403 })
    }

    await pool.query(`DELETE FROM calendar_events WHERE id = $1`, [eventId])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete event error:", err)
    return NextResponse.json({ success: false, message: "Failed to delete event" }, { status: 500 })
  }
}
