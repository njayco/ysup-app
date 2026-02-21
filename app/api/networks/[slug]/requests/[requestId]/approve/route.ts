import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { slug: string; requestId: string } }
) {
  try {
    const body = await request.json()
    const { userId } = body

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

    const reqResult = await pool.query(
      "SELECT * FROM network_join_requests WHERE id = $1 AND network_id = $2",
      [parseInt(params.requestId), network.id]
    )

    if (reqResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 })
    }

    const joinReq = reqResult.rows[0]

    await pool.query(
      "UPDATE network_join_requests SET status = 'approved' WHERE id = $1",
      [joinReq.id]
    )

    await pool.query(
      "INSERT INTO network_members (network_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [network.id, joinReq.user_id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Approve request error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
