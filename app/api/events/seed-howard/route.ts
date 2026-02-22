import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

const HOWARD_EVENTS = [
  { date: "2025-08-11", time: null, title: "Bison Week Begins", desc: "Orientation, Academic Advisement and Course Registration for all New Undergraduate Students (Aug 11-15)" },
  { date: "2025-08-18", time: null, title: "Formal Classes Begin - Fall 2025", desc: "First day of formal classes for Fall semester" },
  { date: "2025-08-22", time: null, title: "Deadline: Intra-university Transfer Applications", desc: "Deadline for receipt of approved applications for Intra-university Transfer for Fall 2026 in the Office of the Registrar" },
  { date: "2025-09-01", time: null, title: "University Closed - Labor Day", desc: "University Closed – Labor Day Observed" },
  { date: "2025-09-05", time: null, title: "Last Day to Register/Add/Drop - Fall 2025", desc: "Last day to add or drop a course without a grade of 'W', change sections, change credit/audit. Deadline to withdraw for 100% refund." },
  { date: "2025-09-08", time: null, title: "Graduation Application Opens - Fall 2025", desc: "Graduation Application available via BisonHub for Fall 2025 prospective candidates" },
  { date: "2025-09-12", time: null, title: "Deadline: Instructors Verify Participation", desc: "Deadline for instructors to verify course participation in BisonHub for Fall 2025" },
  { date: "2025-09-19", time: "11:00", title: "Opening Convocation", desc: "Cramton Auditorium, 11:00 A.M. Classes Suspended from 10:00 A.M.–1:00 P.M." },
  { date: "2025-10-03", time: null, title: "Preliminary Enrollment Census Date", desc: "Preliminary Enrollment Census Date" },
  { date: "2025-10-10", time: null, title: "Deadline: Midterm Grades Due", desc: "Deadline for instructors to submit Interim/Midterm Grades in BisonHub for Fall 2025" },
  { date: "2025-10-13", time: null, title: "University Closed - Mental Health Day", desc: "University Closed – Mental Health Day" },
  { date: "2025-10-17", time: null, title: "Graduation Application Deadline - Fall 2025", desc: "Graduation Application deadline for Fall 2025 prospective candidates. Also Final Enrollment Census." },
  { date: "2025-10-24", time: null, title: "Deadline: Withdrawal (25% Refund)", desc: "Deadline to withdraw from the university to receive 25% refund of tuition/fees" },
  { date: "2025-10-25", time: null, title: "Senior Comprehensive Exams - COAS", desc: "Senior Comprehensive Examination in major fields for College of Arts and Sciences prospective graduates" },
  { date: "2025-10-27", time: null, title: "Spring 2026 Registration - Seniors", desc: "Spring 2026 registration opens for Senior students" },
  { date: "2025-10-28", time: null, title: "Spring 2026 Registration - Juniors", desc: "Spring 2026 registration opens for Junior students" },
  { date: "2025-10-29", time: null, title: "Spring 2026 Registration - Sophomores", desc: "Spring 2026 registration opens for Sophomore students" },
  { date: "2025-10-30", time: null, title: "Spring 2026 Registration - Freshmen & Unclassified", desc: "Spring 2026 registration opens for Freshman & Unclassified students" },
  { date: "2025-10-31", time: null, title: "Spring 2026 Registration - Graduate", desc: "Spring 2026 registration opens for Graduate students" },
  { date: "2025-11-11", time: null, title: "University Closed - Veterans Day", desc: "University Closed – Veterans Day Observed" },
  { date: "2025-11-14", time: null, title: "Deadline: Last Day to Withdraw from Course", desc: "Last day to withdraw from a Fall 2025 course. Last day to complete withdrawal from university (no refunds). Deadline for prospective Fall 2025 graduates to apply for graduation." },
  { date: "2025-11-26", time: "12:00", title: "University Closure - Half Day / Classes End", desc: "Classes & university services suspended at noon. Formal classes end for Fall 2025. Deadline for students to clear Spring and Summer 2025 incomplete grades." },
  { date: "2025-11-27", time: null, title: "University Closed - Thanksgiving Recess Begins", desc: "University Closed – Thanksgiving Recess (Nov 27-30)" },
  { date: "2025-12-01", time: null, title: "Reading Period Begins", desc: "Reading Period (Dec 1-3)" },
  { date: "2025-12-03", time: null, title: "Deadline: Instructor Grade Changes Due", desc: "Deadline for Instructors to submit Grade Changes in BisonHub for removal of Spring 2025 and Summer 2025 Incomplete grades" },
  { date: "2025-12-04", time: null, title: "Departmental Examinations Begin", desc: "Departmental Examinations (Dec 4-5)" },
  { date: "2025-12-08", time: null, title: "Final Examinations Begin", desc: "Final Examinations (Dec 8-12)" },
  { date: "2025-12-16", time: null, title: "Fall 2025 Semester Ends", desc: "Official Graduation Date for Fall 2025 degree recipients" },
  { date: "2025-12-17", time: null, title: "University Closed - Winter Recess Begins", desc: "University Closed – Winter Recess (Dec 17 - Jan 1)" },

  { date: "2026-01-06", time: null, title: "Spring 2026 Orientation", desc: "Orientation, Academic Advisement, Course Registration" },
  { date: "2026-01-12", time: null, title: "Formal Classes Begin - Spring 2026", desc: "First day of formal classes for Spring semester" },
  { date: "2026-01-16", time: null, title: "Deadline: Intra-university Transfer - Spring", desc: "Deadline for receipt of approved applications for Intra-university Transfers for Spring 2026" },
  { date: "2026-01-19", time: null, title: "University Closed - MLK Jr. Day", desc: "University Closed – Martin Luther King Jr. Day" },
  { date: "2026-01-23", time: null, title: "Deadline: Fall 2025 Graduation Recommendations", desc: "Deadline for receipt of Fall 2025 Graduation Recommendations in the Office of the Registrar" },
  { date: "2026-01-30", time: null, title: "Last Day to Register/Add/Drop - Spring 2026", desc: "Last day to add or drop a course without 'W'. Deadline to withdraw for 100% refund." },
  { date: "2026-02-02", time: null, title: "Deadline: Instructors Verify Participation", desc: "Deadline for instructors to verify course participation in BisonHub for Spring 2026" },
  { date: "2026-02-09", time: null, title: "Graduation Application Opens - Spring 2026", desc: "Graduation Application available via BisonHub for Spring 2026 prospective candidates" },
  { date: "2026-02-13", time: null, title: "Enrollment Census / 50% Refund Deadline", desc: "Preliminary Enrollment Census Date. Deadline to withdraw for 50% refund." },
  { date: "2026-02-16", time: null, title: "University Closed - Presidents Day", desc: "University Closed – Presidents Day" },
  { date: "2026-03-02", time: null, title: "Summer 2026 Registration Opens", desc: "Summer 2026 Registration begins for Continuing Students via BisonHub" },
  { date: "2026-03-06", time: "11:00", title: "Charter Day Convocation", desc: "Cramton Auditorium, 11:00 A.M. Classes suspended from 10:00 A.M. - 1:00 P.M. Midterm grades due. 25% refund deadline." },
  { date: "2026-03-07", time: null, title: "University Closed - Spring Recess Begins", desc: "University Closed – Spring Recess (Mar 7-15)" },
  { date: "2026-03-13", time: null, title: "Final Enrollment Census Date", desc: "Final Enrollment Census Date" },
  { date: "2026-03-23", time: null, title: "Fall 2026 Registration - Seniors", desc: "Fall 2026 registration opens for Senior students" },
  { date: "2026-03-24", time: null, title: "Fall 2026 Registration - Juniors", desc: "Fall 2026 registration opens for Junior students" },
  { date: "2026-03-25", time: null, title: "Fall 2026 Registration - Sophomores", desc: "Fall 2026 registration opens for Sophomore students" },
  { date: "2026-03-26", time: null, title: "Fall 2026 Registration - Freshmen & Unclassified", desc: "Fall 2026 registration opens for Freshman & Unclassified students" },
  { date: "2026-03-27", time: null, title: "Fall 2026 Registration - Graduate", desc: "Fall 2026 registration opens for Graduate students" },
  { date: "2026-03-28", time: null, title: "Senior Comprehensive Exams - COAS", desc: "Senior Comprehensive Examinations for College of Arts and Sciences prospective graduates" },
  { date: "2026-04-03", time: null, title: "University Closed - Mental Health Day", desc: "University Closed – Mental Health Day" },
  { date: "2026-04-10", time: null, title: "Last Day to Withdraw from Spring 2026 Course", desc: "Last day to withdraw from a Spring 2026 course. Last day to complete total withdrawal from the University (no refunds)." },
  { date: "2026-04-17", time: null, title: "Deadline: Apply for Spring 2026 Graduation", desc: "Deadline for prospective Spring 2026 graduates to apply for graduation via BisonHub" },
  { date: "2026-04-21", time: null, title: "Final Exams for Prospective Graduates Begin", desc: "Final Examinations for Prospective Spring 2026 Graduates (Apr 21-23)" },
  { date: "2026-04-27", time: null, title: "Formal Classes End - Spring 2026", desc: "Formal Classes End. Deadline for Instructors to submit grades for prospective graduates. Deadline for students to clear Fall 2025 incomplete grades." },
  { date: "2026-04-28", time: null, title: "Reading Period Begins", desc: "Reading Period (Apr 28-29)" },
  { date: "2026-04-29", time: null, title: "Deadline: Instructor Grade Changes Due", desc: "Deadline for Instructors to submit Grade Changes for Fall 2025 Incomplete grades" },
  { date: "2026-04-30", time: null, title: "Departmental Examinations Begin", desc: "Departmental Examinations (Apr 30 - May 1)" },
  { date: "2026-05-08", time: null, title: "Spring 2026 Semester Ends", desc: "Second Semester Ends" },
  { date: "2026-05-09", time: "10:00", title: "Commencement Ceremony", desc: "Upper Quadrangle - Main Campus, 10:00 A.M. Official Graduation Date for all Spring 2026 degree recipients." },
  { date: "2026-05-29", time: null, title: "Deadline: Spring 2026 Graduation Recommendations", desc: "Deadline for receipt of Spring 2026 Graduation Recommendations in the Office of the Registrar" },

  { date: "2026-05-18", time: null, title: "Summer Session I & 10-Week Session Begin", desc: "Formal Classes Begin for Summer Session I and Summer 10-Week Session. Last day to Add/Drop with no penalty." },
  { date: "2026-05-22", time: null, title: "Summer Session I: 50% Refund Deadline", desc: "Deadline to withdraw for 50% refund. Deadline for faculty to verify participation in Summer Session I." },
  { date: "2026-05-26", time: null, title: "University Closed - Memorial Day", desc: "University Closed – Memorial Day" },
  { date: "2026-05-29", time: null, title: "Summer 10-Week: 50% Refund / Session I: 25% Refund Deadline", desc: "Deadline to withdraw for 50% refund (10-week) and 25% refund (Session I). Faculty verify participation for 10-week." },
  { date: "2026-06-01", time: null, title: "Graduation Application Opens - Summer 2026", desc: "Graduation Application available via BisonHub for Summer 2026 prospective candidates" },
  { date: "2026-06-05", time: null, title: "Summer Session I: Last Day to Withdraw", desc: "Last Day to Withdraw from a Course or complete total withdrawal (no refunds) for Summer Session I" },
  { date: "2026-06-12", time: null, title: "Summer 10-Week: 25% Refund Deadline", desc: "Deadline to withdraw from 10-week session for 25% refund" },
  { date: "2026-06-16", time: null, title: "Formal Classes End - Summer Session I", desc: "Formal Classes End for Summer Session I" },
  { date: "2026-06-17", time: null, title: "Summer Session I Final Exams Begin", desc: "Final Exams for Summer Session I (Jun 17-20)" },
  { date: "2026-06-19", time: null, title: "University Closed - Juneteenth", desc: "University Closed – Juneteenth. Also 10-week session: last day to withdraw from course." },
  { date: "2026-06-21", time: null, title: "Summer Session I Ends", desc: "Summer Session I Ends" },
  { date: "2026-06-22", time: null, title: "Summer Session II Begins", desc: "Summer Session II: Formal Classes Begin. Last day to Add/Drop. Deadline for 100% refund." },
  { date: "2026-06-26", time: null, title: "Summer Session II: 50% Refund Deadline", desc: "Deadline to withdraw for 50% refund. Deadline for faculty to verify participation in Session II." },
  { date: "2026-07-02", time: null, title: "Final Summer Enrollment Census", desc: "Final Summer Enrollment Census" },
  { date: "2026-07-03", time: null, title: "University Closed - Independence Day Observed", desc: "University Closed – Independence Day Observed. Session II: 25% refund deadline." },
  { date: "2026-07-11", time: null, title: "Deadline: Apply for Summer 2026 Graduation", desc: "Deadline for prospective Summer 2026 graduates to apply for graduation. Session II: Last day to withdraw from course." },
  { date: "2026-07-21", time: null, title: "Formal Classes End - Session II & 10-Week", desc: "Formal Classes End for Session II and Summer 10-Week Session" },
  { date: "2026-07-25", time: null, title: "Summer 2026 Semester Ends", desc: "Official Graduation Date for Summer 2026 degree recipients" },
  { date: "2026-08-07", time: null, title: "Deadline: Summer 2026 Graduation Recommendations", desc: "Deadline for receipt of Summer 2026 Graduation Recommendations to the Office of the Registrar" },
]

export async function POST(req: NextRequest) {
  try {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const existing = await client.query(
        `SELECT COUNT(*) FROM calendar_events WHERE source = 'howard_university'`
      )
      if (parseInt(existing.rows[0].count) > 0) {
        await client.query("ROLLBACK")
        client.release()
        return NextResponse.json({ success: false, message: "Howard University events already seeded. Delete existing ones first if you want to re-seed." })
      }

      const howardUsers = await client.query(
        `SELECT id FROM users WHERE college = 'Howard University'`
      )
      const userIds = howardUsers.rows.map((r: { id: number }) => r.id)

      if (userIds.length === 0) {
        await client.query("ROLLBACK")
        client.release()
        return NextResponse.json({ success: false, message: "No Howard University users found" })
      }

      const creatorId = userIds[0]
      let eventsCreated = 0
      let invitesSent = 0

      for (const event of HOWARD_EVENTS) {
        const eventResult = await client.query(
          `INSERT INTO calendar_events (title, description, event_date, event_time, location, creator_id, source)
           VALUES ($1, $2, $3, $4, $5, $6, 'howard_university') RETURNING id`,
          [event.title, event.desc, event.date, event.time, "Howard University", creatorId]
        )
        const eventId = eventResult.rows[0].id
        eventsCreated++

        for (const uid of userIds) {
          await client.query(
            `INSERT INTO event_invites (event_id, user_id, rsvp) VALUES ($1, $2, 'going')
             ON CONFLICT (event_id, user_id) DO NOTHING`,
            [eventId, uid]
          )
          invitesSent++
        }
      }

      await client.query("COMMIT")
      return NextResponse.json({
        success: true,
        eventsCreated,
        invitesSent,
        howardUserCount: userIds.length,
      })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Seed Howard events error:", err)
    return NextResponse.json({ success: false, message: "Failed to seed events" }, { status: 500 })
  }
}
