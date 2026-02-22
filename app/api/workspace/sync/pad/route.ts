import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { docsBatchUpdate, googleFetch } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, docId, content } = body

    if (!userId || !docId || content === undefined) {
      return NextResponse.json({ error: "userId, docId, and content are required" }, { status: 400 })
    }

    const docCheck = await pool.query(
      "SELECT * FROM workspace_docs WHERE google_file_id = $1 AND user_id = $2",
      [docId, userId]
    )
    if (docCheck.rows.length === 0) {
      return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 403 })
    }

    const docRes = await googleFetch(`https://docs.googleapis.com/v1/documents/${docId}`, undefined, "google-docs")
    if (!docRes.ok) throw new Error("Failed to fetch document")
    const doc = await docRes.json()

    const requests: any[] = []
    const bodyContent = doc.body?.content || []
    let endIndex = 1
    for (const el of bodyContent) {
      if (el.endIndex) endIndex = el.endIndex
    }

    if (endIndex > 2) {
      requests.push({
        deleteContentRange: {
          range: { startIndex: 1, endIndex: endIndex - 1 },
        },
      })
    }

    const plainText = content.replace(/<[^>]*>/g, "").trim()
    if (plainText) {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: plainText,
        },
      })
    }

    if (requests.length > 0) {
      await docsBatchUpdate(docId, requests)
    }

    await pool.query(
      "UPDATE workspace_docs SET updated_at = NOW() WHERE google_file_id = $1 AND user_id = $2",
      [docId, userId]
    )

    await pool.query(
      `INSERT INTO sync_history (user_id, workspace_doc_id, action, doc_type, google_file_id, status)
       VALUES ($1, $2, 'sync_content', 'pad', $3, 'success')`,
      [userId, docCheck.rows[0].id, docId]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Pad sync error:", error)
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 })
  }
}
