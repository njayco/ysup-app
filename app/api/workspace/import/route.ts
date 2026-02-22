import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { googleFetch } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, googleUrl, fileId: providedFileId } = body

    if (!userId || !type) {
      return NextResponse.json({ error: "userId and type are required" }, { status: 400 })
    }

    if (!["pad", "calc", "slideshow"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    let fileId = providedFileId
    if (!fileId && googleUrl) {
      const match = googleUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (match) fileId = match[1]
    }

    if (!fileId) {
      return NextResponse.json({ error: "fileId or googleUrl required" }, { status: 400 })
    }

    const res = await googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink`, undefined, "google-drive")
    if (!res.ok) {
      return NextResponse.json({ error: "Cannot access this file. Make sure it was created by this app or shared with you." }, { status: 403 })
    }

    const fileMeta = await res.json()

    const urlPrefixes: Record<string, string> = {
      pad: "https://docs.google.com/document/d/",
      calc: "https://docs.google.com/spreadsheets/d/",
      slideshow: "https://docs.google.com/presentation/d/",
    }
    const docUrl = `${urlPrefixes[type]}${fileId}/edit`

    const result = await pool.query(
      `INSERT INTO workspace_docs (user_id, type, title, google_file_id, google_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, fileMeta.name || "Imported Document", fileId, docUrl]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Workspace import error:", error)
    return NextResponse.json({ error: error.message || "Failed to import document" }, { status: 500 })
  }
}
