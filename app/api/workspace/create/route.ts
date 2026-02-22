import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { driveCreateFile } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title } = body

    if (!userId || !type || !title) {
      return NextResponse.json({ error: "userId, type, and title are required" }, { status: 400 })
    }

    if (!["pad", "calc", "slideshow"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const file = await driveCreateFile(type, title)

    const result = await pool.query(
      `INSERT INTO workspace_docs (user_id, type, title, google_file_id, google_url, google_preview_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, type, title, file.fileId, file.url, file.previewUrl]
    )

    await pool.query(
      `INSERT INTO sync_history (user_id, workspace_doc_id, action, doc_type, google_file_id, status)
       VALUES ($1, $2, $3, $4, $5, 'success')`,
      [userId, result.rows[0].id, "create", type, file.fileId]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Workspace create error:", error)
    return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 })
  }
}
