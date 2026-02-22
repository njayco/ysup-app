import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { createMeetSpace, endMeetSpace } from "@/lib/google"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  const filter = req.nextUrl.searchParams.get("filter") || "all"
  const meetingId = req.nextUrl.searchParams.get("meetingId")

  if (meetingId) {
    const result = await pool.query(
      `SELECT m.*, u.username as host_username, u."firstName" as host_first_name, u."lastName" as host_last_name,
        cn.name as network_name,
        (SELECT COUNT(*) FROM chalkboard_participants WHERE meeting_id = m.id AND left_at IS NULL AND rsvp_status = 'joined') as participant_count
       FROM chalkboard_meetings m
       JOIN users u ON m.host_user_id = u.id
       LEFT JOIN class_networks cn ON m.network_id = cn.id
       WHERE m.id = $1`,
      [meetingId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: "Meeting not found" }, { status: 404 })

    const participants = await pool.query(
      `SELECT cp.*, u.username, u."firstName", u."lastName"
       FROM chalkboard_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.meeting_id = $1
       ORDER BY cp.joined_at DESC`,
      [meetingId]
    )

    return NextResponse.json({ meeting: result.rows[0], participants: participants.rows })
  }

  let query = ""
  let params: any[] = [userId]

  if (filter === "my") {
    query = `SELECT m.*, u.username as host_username, u."firstName" as host_first_name, u."lastName" as host_last_name,
        cn.name as network_name,
        (SELECT COUNT(*) FROM chalkboard_participants WHERE meeting_id = m.id AND left_at IS NULL AND rsvp_status = 'joined') as participant_count
       FROM chalkboard_meetings m
       JOIN users u ON m.host_user_id = u.id
       LEFT JOIN class_networks cn ON m.network_id = cn.id
       WHERE m.host_user_id = $1
       ORDER BY m.created_at DESC LIMIT 50`
  } else if (filter === "active") {
    query = `SELECT m.*, u.username as host_username, u."firstName" as host_first_name, u."lastName" as host_last_name,
        cn.name as network_name,
        (SELECT COUNT(*) FROM chalkboard_participants WHERE meeting_id = m.id AND left_at IS NULL AND rsvp_status = 'joined') as participant_count
       FROM chalkboard_meetings m
       JOIN users u ON m.host_user_id = u.id
       LEFT JOIN class_networks cn ON m.network_id = cn.id
       WHERE m.status = 'active'
       ORDER BY m.created_at DESC LIMIT 50`
  } else if (filter === "scheduled") {
    query = `SELECT m.*, u.username as host_username, u."firstName" as host_first_name, u."lastName" as host_last_name,
        cn.name as network_name,
        (SELECT COUNT(*) FROM chalkboard_participants WHERE meeting_id = m.id AND left_at IS NULL AND rsvp_status = 'joined') as participant_count
       FROM chalkboard_meetings m
       JOIN users u ON m.host_user_id = u.id
       LEFT JOIN class_networks cn ON m.network_id = cn.id
       WHERE m.meeting_type = 'scheduled' AND m.status IN ('active', 'scheduled')
         AND m.scheduled_start > NOW()
       ORDER BY m.scheduled_start ASC LIMIT 50`
  } else if (filter === "invited") {
    query = `SELECT m.*, u.username as host_username, u."firstName" as host_first_name, u."lastName" as host_last_name,
        cn.name as network_name,
        (SELECT COUNT(*) FROM chalkboard_participants WHERE meeting_id = m.id AND left_at IS NULL AND rsvp_status = 'joined') as participant_count
       FROM chalkboard_meetings m
       JOIN users u ON m.host_user_id = u.id
       LEFT JOIN class_networks cn ON m.network_id = cn.id
       JOIN chalkboard_participants cp ON cp.meeting_id = m.id AND cp.user_id = $1
       WHERE m.status IN ('active', 'scheduled')
       ORDER BY m.created_at DESC LIMIT 50`
  } else {
    query = `SELECT m.*, u.username as host_username, u."firstName" as host_first_name, u."lastName" as host_last_name,
        cn.name as network_name,
        (SELECT COUNT(*) FROM chalkboard_participants WHERE meeting_id = m.id AND left_at IS NULL AND rsvp_status = 'joined') as participant_count
       FROM chalkboard_meetings m
       JOIN users u ON m.host_user_id = u.id
       LEFT JOIN class_networks cn ON m.network_id = cn.id
       WHERE m.host_user_id = $1
          OR m.id IN (SELECT meeting_id FROM chalkboard_participants WHERE user_id = $1)
       ORDER BY m.created_at DESC LIMIT 50`
  }

  const result = await pool.query(query, params)
  return NextResponse.json({ meetings: result.rows })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, title, description, meetingType, scheduledStart, scheduledEnd, networkId } = body

  if (!userId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    let meetUri = ""
    let meetCode = ""
    let meetSpaceName = ""

    try {
      const space = await createMeetSpace()
      meetUri = space.meetingUri
      meetCode = space.meetingCode
      meetSpaceName = space.spaceName
    } catch (e: any) {
      meetUri = `https://meet.google.com/new`
      meetCode = ""
      meetSpaceName = ""
    }

    const status = meetingType === "scheduled" ? "scheduled" : "active"

    const result = await pool.query(
      `INSERT INTO chalkboard_meetings (title, description, meet_space_name, meet_uri, meet_code, host_user_id, network_id, meeting_type, scheduled_start, scheduled_end, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description || null, meetSpaceName, meetUri, meetCode, userId, networkId || null, meetingType || "instant", scheduledStart || null, scheduledEnd || null, status]
    )

    const meeting = result.rows[0]

    await pool.query(
      `INSERT INTO chalkboard_participants (meeting_id, user_id, role, rsvp_status)
       VALUES ($1, $2, 'host', 'joined')`,
      [meeting.id, userId]
    )

    return NextResponse.json({ meeting })
  } catch (e: any) {
    console.error("Create meeting error:", e)
    return NextResponse.json({ error: e.message || "Failed to create meeting" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { userId, meetingId, action, inviteUserIds } = body

  if (!userId || !meetingId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    if (action === "join") {
      const meetingCheck = await pool.query(
        `SELECT status FROM chalkboard_meetings WHERE id = $1`,
        [meetingId]
      )
      if (meetingCheck.rows.length === 0) {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
      }
      if (meetingCheck.rows[0].status === "ended") {
        return NextResponse.json({ error: "Meeting has ended" }, { status: 400 })
      }
      await pool.query(
        `INSERT INTO chalkboard_participants (meeting_id, user_id, role, rsvp_status, joined_at)
         VALUES ($1, $2, 'participant', 'joined', NOW())
         ON CONFLICT (meeting_id, user_id)
         DO UPDATE SET rsvp_status = 'joined', joined_at = NOW(), left_at = NULL`,
        [meetingId, userId]
      )
      return NextResponse.json({ success: true })
    }

    if (action === "leave") {
      await pool.query(
        `UPDATE chalkboard_participants SET left_at = NOW(), rsvp_status = 'left'
         WHERE meeting_id = $1 AND user_id = $2`,
        [meetingId, userId]
      )
      return NextResponse.json({ success: true })
    }

    if (action === "end") {
      const meeting = await pool.query(
        `SELECT * FROM chalkboard_meetings WHERE id = $1 AND host_user_id = $2`,
        [meetingId, userId]
      )
      if (meeting.rows.length === 0) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }

      if (meeting.rows[0].meet_space_name) {
        try {
          await endMeetSpace(meeting.rows[0].meet_space_name)
        } catch (e) {}
      }

      await pool.query(
        `UPDATE chalkboard_meetings SET status = 'ended', updated_at = NOW() WHERE id = $1`,
        [meetingId]
      )
      await pool.query(
        `UPDATE chalkboard_participants SET left_at = NOW() WHERE meeting_id = $1 AND left_at IS NULL`,
        [meetingId]
      )
      return NextResponse.json({ success: true })
    }

    if (action === "invite" && inviteUserIds) {
      for (const inviteeId of inviteUserIds) {
        await pool.query(
          `INSERT INTO chalkboard_participants (meeting_id, user_id, role, rsvp_status, invited_at)
           VALUES ($1, $2, 'participant', 'invited', NOW())
           ON CONFLICT (meeting_id, user_id) DO NOTHING`,
          [meetingId, inviteeId]
        )

        const meetingData = await pool.query(`SELECT title FROM chalkboard_meetings WHERE id = $1`, [meetingId])
        const hostData = await pool.query(`SELECT username FROM users WHERE id = $1`, [userId])
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, content, created_at)
           VALUES ($1, 'general', $2, $3, NOW())`,
          [inviteeId, "Chalkboard Invite", `${hostData.rows[0]?.username || "Someone"} invited you to "${meetingData.rows[0]?.title || "a meeting"}"`]
        )
      }
      return NextResponse.json({ success: true })
    }

    if (action === "rsvp") {
      const rsvpStatus = body.rsvpStatus || "accepted"
      await pool.query(
        `UPDATE chalkboard_participants SET rsvp_status = $1
         WHERE meeting_id = $2 AND user_id = $3`,
        [rsvpStatus, meetingId, userId]
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (e: any) {
    console.error("Meeting action error:", e)
    return NextResponse.json({ error: e.message || "Action failed" }, { status: 500 })
  }
}
