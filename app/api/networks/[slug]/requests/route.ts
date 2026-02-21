import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const networkResult = await pool.query(
      "SELECT * FROM class_networks WHERE slug = $1",
      [params.slug]
    )

    if (networkResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Network not found" }, { status: 404 })
    }

    const network = networkResult.rows[0]

    if (network.moderator_user_id !== parseInt(userId)) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 })
    }

    const requestsResult = await pool.query(
      `SELECT njr.*, u.first_name, u.last_name, u.username, u.college
      FROM network_join_requests njr
      JOIN users u ON u.id = njr.user_id
      WHERE njr.network_id = $1 AND njr.status = 'pending'
      ORDER BY njr.created_at DESC`,
      [network.id]
    )

    return NextResponse.json({ success: true, requests: requestsResult.rows })
  } catch (error) {
    console.error("Get join requests error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
