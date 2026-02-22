import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

function getEasternTime() {
  const now = new Date()
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  return eastern
}

function formatTime12h(h: number, m: number) {
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`
}

export async function POST(req: NextRequest) {
  try {
    const eastern = getEasternTime()
    const year = eastern.getFullYear()
    const month = String(eastern.getMonth() + 1).padStart(2, "0")
    const day = String(eastern.getDate()).padStart(2, "0")
    const todayStr = `${year}-${month}-${day}`
    const currentHour = eastern.getHours()
    const currentMinute = eastern.getMinutes()

    const client = await pool.connect()
    try {
      let notificationsCreated = 0

      const allDayEvents = await client.query(
        `SELECT ce.id, ce.title, ce.description, ce.event_date
         FROM calendar_events ce
         WHERE ce.source = 'howard_university'
           AND ce.event_date = $1
           AND ce.event_time IS NULL`,
        [todayStr]
      )

      const howardUsers = await client.query(
        `SELECT id FROM users WHERE college = 'Howard University'`
      )

      for (const event of allDayEvents.rows) {
        for (const user of howardUsers.rows) {
          const existing = await client.query(
            `SELECT id FROM notifications
             WHERE user_id = $1 AND type = 'calendar_reminder' AND meta->>'event_id' = $2
               AND created_at::date = $3`,
            [user.id, String(event.id), todayStr]
          )

          if (existing.rows.length === 0) {
            await client.query(
              `INSERT INTO notifications (user_id, type, title, message, meta)
               VALUES ($1, 'calendar_reminder', $2, $3, $4)`,
              [
                user.id,
                `Today: ${event.title}`,
                event.description || event.title,
                JSON.stringify({ event_id: String(event.id), reminder_type: "all_day" }),
              ]
            )
            notificationsCreated++
          }
        }
      }

      const timedEvents = await client.query(
        `SELECT ce.id, ce.title, ce.description, ce.event_date, ce.event_time
         FROM calendar_events ce
         WHERE ce.source = 'howard_university'
           AND ce.event_date = $1
           AND ce.event_time IS NOT NULL`,
        [todayStr]
      )

      for (const event of timedEvents.rows) {
        const timeStr = String(event.event_time)
        const [eh, em] = timeStr.split(":").map(Number)
        const eventMinutesSinceMidnight = eh * 60 + em
        const currentMinutesSinceMidnight = currentHour * 60 + currentMinute
        const alertWindowStart = eventMinutesSinceMidnight - 120
        const alertWindowEnd = eventMinutesSinceMidnight

        if (currentMinutesSinceMidnight >= alertWindowStart && currentMinutesSinceMidnight <= alertWindowEnd) {
          for (const user of howardUsers.rows) {
            const existing = await client.query(
              `SELECT id FROM notifications
               WHERE user_id = $1 AND type = 'calendar_alert' AND meta->>'event_id' = $2`,
              [user.id, String(event.id)]
            )

            if (existing.rows.length === 0) {
              await client.query(
                `INSERT INTO notifications (user_id, type, title, message, meta)
                 VALUES ($1, 'calendar_alert', $2, $3, $4)`,
                [
                  user.id,
                  `Coming Up: ${event.title}`,
                  `Starts at ${formatTime12h(eh, em)} today. ${event.description || ""}`.trim(),
                  JSON.stringify({ event_id: String(event.id), reminder_type: "timed_alert" }),
                ]
              )
              notificationsCreated++
            }
          }
        }
      }

      client.release()

      return NextResponse.json({
        success: true,
        notificationsCreated,
        allDayEventsFound: allDayEvents.rows.length,
        timedEventsFound: timedEvents.rows.length,
        checkedDate: todayStr,
        checkedTimeET: formatTime12h(currentHour, currentMinute),
      })
    } catch (err) {
      client.release()
      throw err
    }
  } catch (err) {
    console.error("Notify cron error:", err)
    return NextResponse.json({ success: false, message: "Failed to process notifications" }, { status: 500 })
  }
}
