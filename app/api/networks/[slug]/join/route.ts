import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const parsedUserId = parseInt(userId)

    const networkResult = await pool.query(
      "SELECT * FROM class_networks WHERE slug = $1",
      [params.slug]
    )

    if (networkResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Network not found" }, { status: 404 })
    }

    const network = networkResult.rows[0]

    const memberCheck = await pool.query(
      "SELECT id FROM network_members WHERE network_id = $1 AND user_id = $2",
      [network.id, parsedUserId]
    )

    if (memberCheck.rows.length > 0) {
      return NextResponse.json({ success: true, joined: true, message: "Already a member" })
    }

    if (network.privacy === "public") {
      await pool.query(
        "INSERT INTO network_members (network_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [network.id, parsedUserId]
      )
      await pool.query(
        "DELETE FROM network_join_requests WHERE network_id = $1 AND user_id = $2",
        [network.id, parsedUserId]
      )
      return NextResponse.json({ success: true, joined: true })
    }

    const existingRequest = await pool.query(
      "SELECT * FROM network_join_requests WHERE network_id = $1 AND user_id = $2",
      [network.id, parsedUserId]
    )

    if (existingRequest.rows.length > 0) {
      const req = existingRequest.rows[0]
      return NextResponse.json({
        success: true,
        joined: false,
        requested: true,
        status: req.status,
        message: req.status === "pending" ? "Join request already pending" : `Join request was ${req.status}`,
      })
    }

    await pool.query(
      "INSERT INTO network_join_requests (network_id, user_id, status) VALUES ($1, $2, 'pending')",
      [network.id, parsedUserId]
    )

    return NextResponse.json({ success: true, joined: false, requested: true })
  } catch (error) {
    console.error("Join network error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
