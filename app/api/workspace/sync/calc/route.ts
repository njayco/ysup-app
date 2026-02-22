import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { sheetsUpdateValues } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, sheetId, range, values } = body

    if (!userId || !sheetId || !range || !values) {
      return NextResponse.json({ error: "userId, sheetId, range, and values are required" }, { status: 400 })
    }

    const docCheck = await pool.query(
      "SELECT * FROM workspace_docs WHERE google_file_id = $1 AND user_id = $2",
      [sheetId, userId]
    )
    if (docCheck.rows.length === 0) {
      return NextResponse.json({ error: "Sheet not found or unauthorized" }, { status: 403 })
    }

    await sheetsUpdateValues(sheetId, range, values)

    await pool.query(
      "UPDATE workspace_docs SET updated_at = NOW() WHERE google_file_id = $1 AND user_id = $2",
      [sheetId, userId]
    )

    await pool.query(
      `INSERT INTO sync_history (user_id, workspace_doc_id, action, doc_type, google_file_id, status)
       VALUES ($1, $2, 'sync_values', 'calc', $3, 'success')`,
      [userId, docCheck.rows[0].id, sheetId]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Calc sync error:", error)
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 })
  }
}
