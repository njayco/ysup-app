import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    let query = "SELECT * FROM workspace_docs WHERE user_id = $1"
    const params: any[] = [parseInt(userId)]

    if (type && ["pad", "calc", "slideshow"].includes(type)) {
      query += " AND type = $2"
      params.push(type)
    }

    query += " ORDER BY updated_at DESC LIMIT 10"

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Workspace recent error:", error)
    return NextResponse.json({ error: "Failed to fetch recent docs" }, { status: 500 })
  }
}
