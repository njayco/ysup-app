import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getAccessToken } from "@/lib/google"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, presentationId, slides } = body

    if (!userId || !presentationId || !slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: "userId, presentationId, and slides array are required" }, { status: 400 })
    }

    const docCheck = await pool.query(
      "SELECT * FROM workspace_docs WHERE google_file_id = $1 AND user_id = $2",
      [presentationId, userId]
    )
    if (docCheck.rows.length === 0) {
      return NextResponse.json({ error: "Presentation not found or unauthorized" }, { status: 403 })
    }

    const accessToken = await getAccessToken()

    for (const slide of slides) {
      const slideId = crypto.randomBytes(8).toString("hex")

      const createRes = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                createSlide: {
                  objectId: slideId,
                  slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
                },
              },
            ],
          }),
        }
      )

      if (!createRes.ok) {
        const errData = await createRes.json()
        throw new Error(errData.error?.message || "Failed to create slide")
      }

      const presRes = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}/pages/${slideId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!presRes.ok) continue

      const pageData = await presRes.json()
      const elements = pageData.pageElements || []

      let titleId: string | null = null
      let bodyId: string | null = null

      for (const el of elements) {
        if (el.shape?.placeholder?.type === "TITLE" || el.shape?.placeholder?.type === "CENTERED_TITLE") {
          titleId = el.objectId
        } else if (el.shape?.placeholder?.type === "BODY" || el.shape?.placeholder?.type === "SUBTITLE") {
          bodyId = el.objectId
        }
      }

      const textRequests: any[] = []

      if (slide.title && titleId) {
        textRequests.push({
          insertText: {
            objectId: titleId,
            text: slide.title,
            insertionIndex: 0,
          },
        })
      }

      if (slide.body && bodyId) {
        textRequests.push({
          insertText: {
            objectId: bodyId,
            text: slide.body,
            insertionIndex: 0,
          },
        })
      }

      if (textRequests.length > 0) {
        await fetch(
          `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ requests: textRequests }),
          }
        )
      }
    }

    await pool.query(
      "UPDATE workspace_docs SET updated_at = NOW() WHERE google_file_id = $1 AND user_id = $2",
      [presentationId, userId]
    )

    await pool.query(
      `INSERT INTO sync_history (user_id, workspace_doc_id, action, doc_type, google_file_id, status)
       VALUES ($1, $2, 'sync_slides', 'slideshow', $3, 'success')`,
      [userId, docCheck.rows[0].id, presentationId]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Slideshow sync error:", error)
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 })
  }
}
