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
        ce.*,
        u.first_name AS creator_first_name,
        u.last_name AS creator_last_name,
        u.username AS creator_username,
        (SELECT COUNT(*) FROM event_invites WHERE event_id = ce.id) AS total_invited,
        (SELECT COUNT(*) FROM event_invites WHERE event_id = ce.id AND rsvp = 'going') AS going_count,
        (SELECT COUNT(*) FROM event_invites WHERE event_id = ce.id AND rsvp = 'maybe') AS maybe_count,
        (SELECT COUNT(*) FROM event_invites WHERE event_id = ce.id AND rsvp = 'not_going') AS not_going_count,
        (SELECT rsvp FROM event_invites WHERE event_id = ce.id AND user_id = $1) AS my_rsvp
      FROM calendar_events ce
      JOIN users u ON u.id = ce.creator_id
      WHERE ce.creator_id = $1
        OR ce.id IN (SELECT event_id FROM event_invites WHERE user_id = $1)
      ORDER BY ce.event_date ASC, ce.event_time ASC`,
      [userId]
    )

    return NextResponse.json({ success: true, events: result.rows })
  } catch (err) {
    console.error("Fetch events error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, eventDate, eventTime, endDate, endTime, location, color, creatorId, inviteNetworkIds, inviteUserIds } = body

    if (!title || !eventDate || !creatorId) {
      return NextResponse.json({ success: false, message: "Title, start date, and creator required" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const eventResult = await client.query(
        `INSERT INTO calendar_events (title, description, event_date, event_time, end_date, end_time, location, color, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [title, description || null, eventDate, eventTime || null, endDate || null, endTime || null, location || null, color || 'blue', creatorId]
      )
      const eventId = eventResult.rows[0].id

      const userIdsToInvite = new Set<number>()

      if (inviteNetworkIds && inviteNetworkIds.length > 0) {
        for (const networkId of inviteNetworkIds) {
          const members = await client.query(
            `SELECT user_id FROM network_members WHERE network_id = $1 AND user_id != $2`,
            [networkId, creatorId]
          )
          members.rows.forEach((row: { user_id: number }) => userIdsToInvite.add(row.user_id))
        }
      }

      if (inviteUserIds && inviteUserIds.length > 0) {
        inviteUserIds.forEach((id: number) => {
          if (id !== creatorId) userIdsToInvite.add(id)
        })
      }

      for (const uid of userIdsToInvite) {
        await client.query(
          `INSERT INTO event_invites (event_id, user_id, rsvp) VALUES ($1, $2, 'pending')
           ON CONFLICT (event_id, user_id) DO NOTHING`,
          [eventId, uid]
        )
      }

      await client.query("COMMIT")

      return NextResponse.json({
        success: true,
        eventId,
        invitedCount: userIdsToInvite.size,
      })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Create event error:", err)
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 })
  }
}
